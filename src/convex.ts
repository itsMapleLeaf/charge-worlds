import { raise } from "convex/helpers"
import { ConvexReactClient, Watch } from "convex/react"
import {
	FunctionReference,
	FunctionReturnType,
	OptionalRestArgs,
} from "convex/server"
import { useEffect, useState } from "react"

export const convexClient = new ConvexReactClient(
	import.meta.env.VITE_CONVEX_URL,
)

const cache = new Map<FunctionReference<"query">, Map<string, Watch<unknown>>>()

function getWatch<FuncRef extends FunctionReference<"query">>(
	reference: FuncRef,
	...args: OptionalRestArgs<FuncRef>
) {
	let referenceCache = cache.get(reference)
	if (!referenceCache) {
		referenceCache = new Map()
		cache.set(reference, referenceCache)
	}

	const key = JSON.stringify(args)
	let watch = referenceCache.get(key)
	if (!watch) {
		watch = convexClient.watchQuery(reference, ...args)
		referenceCache.set(key, watch)
	}

	return watch as Watch<FunctionReturnType<FuncRef>>
}

export function useQuerySuspense<FuncRef extends FunctionReference<"query">>(
	reference: FuncRef,
	...args: OptionalRestArgs<FuncRef>
) {
	const watch = getWatch(reference, ...args)

	const initialValue = watch.localQueryResult()
	if (!initialValue) {
		throw new Promise<void>((resolve) => watch.onUpdate(resolve))
	}

	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		return watch.onUpdate(() => {
			setValue(
				watch.localQueryResult() ?? raise("Unexpected: missing query result"),
			)
		})
	}, [watch])

	return value
}

export function useWatchSuspense<T>(watch: Watch<T>) {
	const value = watch.localQueryResult()
	if (value) return value

	throw new Promise((resolve, reject) => {
		watch.onUpdate(() => {
			try {
				resolve(watch.localQueryResult())
			} catch (error) {
				reject(error)
			}
		})
	})
}
