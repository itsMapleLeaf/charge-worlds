import { useEffect, useState } from "react"
import { useLatestRef } from "./react"

export function useSizeCallback(
  elementRef: { readonly current: Element | null } | Element | null | undefined,
  callback: (width: number, height: number) => void,
) {
  const callbackRef = useLatestRef(callback)
  useEffect(() => {
    const element =
      elementRef && "current" in elementRef ? elementRef.current : elementRef
    if (!element) return

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      callbackRef.current(entry.contentRect.width, entry.contentRect.height)
    })

    resizeObserver.observe(element)

    return () => {
      resizeObserver.disconnect()
    }
  }, [callbackRef, elementRef])
}

export function useSize(
  elementRef: { readonly current: Element | null } | Element | null | undefined,
) {
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  useSizeCallback(elementRef, (width, height) => {
    setWidth(width)
    setHeight(height)
  })

  return { width, height }
}
