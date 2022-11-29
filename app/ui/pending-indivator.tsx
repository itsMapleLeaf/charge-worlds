import { useFetchers, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { LoadingSpinner } from "./loading"

export function PendingIndicator() {
  const transition = useTransition()
  const fetchers = useFetchers()
  const pending =
    transition.state !== "idle" || fetchers.some((f) => f.state !== "idle")
  return (
    <div className={clsx("transition", pending ? "opacity-100" : "opacity-0")}>
      <LoadingSpinner size="small" />
    </div>
  )
}
