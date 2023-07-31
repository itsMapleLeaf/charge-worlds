import { useState } from "react"
import { useWindowEvent } from "../helpers/use-window-event"

export function useScroll() {
  const [scrollX, setScrollX] = useState(
    typeof window === "undefined" ? 0 : window.scrollX,
  )
  const [scrollY, setScrollY] = useState(
    typeof window === "undefined" ? 0 : window.scrollY,
  )
  useWindowEvent("scroll", () => {
    setScrollX(window.scrollX)
    setScrollY(window.scrollY)
  })
  return { scrollX, scrollY }
}
