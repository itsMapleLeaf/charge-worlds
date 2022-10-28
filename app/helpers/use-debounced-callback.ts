import { useCallback, useRef } from "react"
import { useLatestRef } from "./react"

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useLatestRef(callback)
  const timeoutRef = useRef<number>()
  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [callbackRef, delay],
  )
}
