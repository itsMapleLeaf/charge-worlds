import { useState } from "react"
import { useSpinDelay } from "spin-delay"

export function useAsyncCallback<Args extends any[], Return>(
  callback: (...args: Args) => Return,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>()
  const [result, setResult] = useState<Awaited<Return>>()

  const execute = async (...args: Args) => {
    setLoading(true)
    try {
      const result = await callback(...args)
      setResult(result)
    } catch (error) {
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  execute.loading = useSpinDelay(loading)
  execute.error = error
  execute.result = result

  return execute
}
