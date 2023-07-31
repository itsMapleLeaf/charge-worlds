import { useEffect, useRef, useState } from "react"
import { raise } from "./errors"

const States = {
  Unmounted: "unmounted",
  InitTransition: "entering",
  Mounted: "mounted",
  Exiting: "exiting",
} as const
type State = (typeof States)[keyof typeof States]

export function useMountTransition() {
  const [state, setState] = useState<State>(States.Unmounted)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // just apply the enter state for one frame to initialize
    if (state === States.InitTransition) {
      setState(States.Mounted)
    }

    // when exiting, wait for the transition to end before setting the state to exited
    if (state === States.Exiting) {
      const handleTransitionEnd = () => {
        setState(States.Unmounted)
      }
      const element = elementRef.current ?? raise("Element ref not set")
      element.addEventListener("transitionend", handleTransitionEnd)
      return () => {
        element.removeEventListener("transitionend", handleTransitionEnd)
      }
    }
  }, [state])

  const isMounted = state !== States.Unmounted
  const isTransitionVisible = state === States.Mounted

  const handleToggle = (open: boolean) => {
    if (state === States.Unmounted && open) {
      setState(States.InitTransition)
    }
    if (state === States.Mounted && !open) {
      setState(States.Exiting)
    }
    if (state === States.Exiting && open) {
      setState(States.InitTransition)
    }
  }

  return { isMounted, isTransitionVisible, handleToggle, elementRef }
}
