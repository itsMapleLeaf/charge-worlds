import { useEffect } from "react"
import { useLatestRef } from "./react"

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
  const callbackRef = useLatestRef(callback)
  useEffect(
    () => emitter.subscribe((value) => callbackRef.current(value)),
    [callbackRef, emitter],
  )
}
