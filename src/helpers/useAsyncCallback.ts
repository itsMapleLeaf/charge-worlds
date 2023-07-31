import { useState } from "react"
import { useSpinDelay } from "spin-delay"

export function useAsyncCallback<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()
  const [result, setResult] = useState<Awaited<Return>>()

  const execute = (...args: Args) => {
    if (loading) return
    setLoading(true)
    setError(undefined)
    void (async () => {
      try {
        const result = await callback(...args)
        setResult(result)
      } catch (error) {
        setError(error)
      }
      setLoading(false)
    })()
  }

  execute.loading = useSpinDelay(loading)
  execute.error = error
  execute.result = result

  return execute
}
