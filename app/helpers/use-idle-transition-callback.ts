import { useFetchers, useTransition } from "@remix-run/react"
import { useEffect } from "react"
import { useLatestRef } from "./react"

export function useIdleTransitionCallback(callback: () => void) {
  const transition = useTransition()
  const fetchers = useFetchers()
  const callbackRef = useLatestRef(callback)

  const states = [transition.state, ...fetchers.map((f) => f.state)]
  const isIdle = states.every((s) => s === "idle")

  useEffect(() => {
    if (isIdle) callbackRef.current()
  }, [callbackRef, isIdle])
}
