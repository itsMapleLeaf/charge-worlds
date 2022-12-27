import { useEffect, useState } from "react"

export function useHasHover() {
  const [hasHover, setHasHover] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(hover: hover)")
    const listener = (event: MediaQueryListEvent) => {
      setHasHover(event.matches)
    }
    query.addEventListener("change", listener)
    setHasHover(query.matches)
    return () => {
      query.removeEventListener("change", listener)
    }
  }, [])
  return hasHover
}
