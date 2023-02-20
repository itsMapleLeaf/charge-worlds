import { useState } from "react"
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect"

let isClient = false

export function ClientOnly(props: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(isClient)
  useIsomorphicLayoutEffect(() => {
    setMounted(true)
    isClient = true
  }, [])
  return mounted ? <>{props.children}</> : null
}
