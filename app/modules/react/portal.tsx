import { useState } from "react"
import { createPortal } from "react-dom"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

export function Portal({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = useState<HTMLElement>()

  useIsomorphicLayoutEffect(() => {
    const container = document.createElement("react-portal")
    document.body.append(container)
    setContainer(container)
    return () => container.remove()
  }, [])

  return container ? createPortal(children, container) : null
}
