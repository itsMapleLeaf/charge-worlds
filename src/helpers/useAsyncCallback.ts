import { useState } from "react"
import { useSpinDelay } from "spin-delay"
import { useEffectEvent } from "./useEffectEvent"

type AsyncState<T> =
	| { status: "idle" }
	| { status: "loading"; token: symbol }
	| { status: "error"; error: unknown }
	| { status: "success"; result: T }

type UseAsyncCallbackOptions<T> = {
	onSuccess?: (result: T) => void
	onError?: (error: unknown) => void
	onSettled?: () => void
	spinDelayOptions?: Parameters<typeof useSpinDelay>[1]
}

export function useAsyncCallback<Args extends unknown[], Return>(
	callback: (...args: Args) => Return,
	options?: UseAsyncCallbackOptions<Awaited<Return>>,
) {
	const [state, setState] = useState<AsyncState<Awaited<Return>>>({
		status: "idle",
	})

	const handleSuccess = useEffectEvent(
		(result: Awaited<Return>, token: symbol) => {
			if (state.status !== "loading" || state.token !== token) return
			setState({ status: "success", result })
			options?.onSuccess?.(result)
			options?.onSettled?.()
		},
	)

	const handleError = useEffectEvent((error: unknown, token: symbol) => {
		if (state.status !== "loading" || state.token !== token) return
		setState({ status: "error", error })
		options?.onError?.(error)
		options?.onSettled?.()
	})

	const run = (...args: Args) => {
		const token = Symbol()
		setState({ status: "loading", token })
		Promise.resolve(callback(...args)).then(
			(result) => handleSuccess(result, token),
			(error) => handleError(error, token),
		)
	}

	run.state = state
	run.loading = useSpinDelay(
		state.status === "loading",
		options?.spinDelayOptions,
	)
	run.error = state.status === "error" ? state.error : undefined
	run.result = state.status === "success" ? state.result : undefined

	return run
}
