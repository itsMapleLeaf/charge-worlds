import { useCallback, useState } from "react"
import type { ZodType } from "zod"

export function useLocalStorage<T>({
  key,
  schema,
}: {
  key: string
  schema: ZodType<T>
}) {
  const [state, setStateInternal] = useState<T>(() => {
    return schema.parse(localStorage.getItem(key))
  })

  const setState = useCallback(
    (newState: T) => {
      setStateInternal(newState)
      localStorage.setItem(key, JSON.stringify(newState))
    },
    [key],
  )

  return [state, setState] as const
}
