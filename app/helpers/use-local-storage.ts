import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import type { ZodType } from "zod"
import { useLatestRef } from "./react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export function useLocalStorage<T>({
  key,
  schema,
  fallback,
}: {
  key: string
  schema: ZodType<T>
  fallback: T
}) {
  const [state, setStateInternal] = useState<T>(fallback)
  const schemaRef = useLatestRef(schema)
  const fallbackRef = useLatestRef(fallback)

  useIsomorphicLayoutEffect(() => {
    const result = schemaRef.current.safeParse(localStorage.getItem(key))
    setStateInternal(result.success ? result.data : fallbackRef.current)
  }, [fallbackRef, key, schemaRef])

  const setState = useCallback(
    (newState: T) => {
      setStateInternal(newState)
      localStorage.setItem(key, JSON.stringify(newState))
    },
    [key],
  )

  return [state, setState] as const
}
