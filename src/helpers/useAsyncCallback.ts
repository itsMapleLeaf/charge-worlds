import { useState } from "react"
import { useSpinDelay } from "spin-delay"

type AsyncState<T> =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "error"; error: unknown }
	| { status: "success"; result: T }

type UseAsyncCallbackOptions<T> = {
	onSuccess?: (result: T) => void
	onError?: (error: unknown) => void
}

export function useAsyncCallback<Args extends unknown[], Return>(
	callback: (...args: Args) => Return,
	options?: UseAsyncCallbackOptions<Awaited<Return>>,
) {
	const [state, setState] = useState<AsyncState<Awaited<Return>>>({
		status: "idle",
	})

	const run = (...args: Args) => {
		if (state.status === "loading") return
		setState({ status: "loading" })
		Promise.resolve(callback(...args)).then(
			(result) => {
				setState({ status: "success", result })
				options?.onSuccess?.(result)
			},
			(error: unknown) => {
				setState({ status: "error", error })
				options?.onError?.(error)
			},
		)
	}

	run.state = state
	run.loading = useSpinDelay(state.status === "loading")
	run.error = state.status === "error" ? state.error : undefined
	run.result = state.status === "success" ? state.result : undefined

	return run
}
