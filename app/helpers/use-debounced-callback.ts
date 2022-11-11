import { useMemo, useRef } from "react"
import { useLatestRef } from "./react"

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useLatestRef(callback)
  const timeoutRef = useRef<number>()
  const activeRef = useRef(false)
  return useMemo(() => {
    const callback = (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      activeRef.current = true
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args)
        activeRef.current = false
      }, delay)
    }
    callback.active = () => activeRef.current
    return callback
  }, [callbackRef, delay])
}
