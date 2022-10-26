import { useSyncExternalStore } from "react"

export class Store<T> {
  private listeners = new Set<(value: T) => void>()

  constructor(private valueInternal: T) {}

  get value(): T {
    return this.valueInternal
  }

  get = (): T => this.value

  set = (value: T) => {
    this.valueInternal = value
    for (const listener of this.listeners) listener(value)
  }

  listen = (listener: (value: T) => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.listen, store.get, store.get)
}
