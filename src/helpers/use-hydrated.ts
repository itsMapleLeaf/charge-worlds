import { useEffect, useLayoutEffect, useState } from "react"

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useIsomorphicLayoutEffect(() => {
    setHydrated(true)
  }, [])
  return hydrated
}
