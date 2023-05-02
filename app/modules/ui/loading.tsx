import clsx from "clsx"
import { Suspense } from "react"

export function LoadingSpinner({
  size = "medium",
}: {
  size?: "small" | "medium"
}) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 grid-rows-2 animate-spin",
        size === "small" && "s-5 gap-0.5",
        size === "medium" && "s-12 gap-1.5",
      )}
    >
      <div className="rounded-full bg-accent-200" />
      <div className="rounded-full bg-accent-400" />
      <div className="rounded-full bg-accent-400" />
      <div className="rounded-full bg-accent-200" />
    </div>
  )
}

export function LoadingPlaceholder() {
  return (
    <div className="flex justify-center p-8">
      <LoadingSpinner />
    </div>
  )
}

export function LoadingSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingPlaceholder />}>{children}</Suspense>
}

export function EmptySuspense({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
