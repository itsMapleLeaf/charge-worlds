import { useCallback, useInsertionEffect, useRef } from "react"

export function useEffectEvent<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
) {
  const ref = useRef((..._args: Args): Return => {
    throw new Error("Attempt to call event callback during render")
  })

  useInsertionEffect(() => {
    ref.current = callback
  })

  return useCallback((...args: Args) => ref.current(...args), [])
}
