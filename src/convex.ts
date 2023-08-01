import { raise } from "convex/helpers"
import { ConvexReactClient, type Watch } from "convex/react"
import { type FunctionReference, type OptionalRestArgs } from "convex/server"
import { useEffect, useState } from "react"

export const convexClient = new ConvexReactClient(
	import.meta.env.VITE_CONVEX_URL,
)

export function useQuerySuspense<FuncRef extends FunctionReference<"query">>(
	reference: FuncRef,
	...args: OptionalRestArgs<FuncRef>
) {
	const watch = convexClient.watchQuery(reference, ...args)

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

	// why is eslint confused by this
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
