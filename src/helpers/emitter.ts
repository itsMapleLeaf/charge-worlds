import { useEffect } from "react"
import { useEffectEvent } from "./useEffectEvent"

export class Emitter<T> {
	private listeners = new Set<(value: T) => void>()

	emit(value: T) {
		for (const listener of this.listeners) listener(value)
	}

	subscribe(listener: (value: T) => void) {
		this.listeners.add(listener)
		return () => {
			this.listeners.delete(listener)
		}
	}
}

export function useEmitterCallback<T>(
	emitter: Emitter<T>,
	callback: (value: T) => void,
) {
	const runCallback = useEffectEvent(callback)
	useEffect(() => emitter.subscribe(runCallback), [emitter, runCallback])
}
