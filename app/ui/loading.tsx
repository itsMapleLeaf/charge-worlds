import clsx from "clsx"
import { Suspense } from "react"

export function LoadingSpinner({ size = 10 }: { size?: 6 | 10 }) {
  return (
    <div
      className={clsx(
        "grid w-fit animate-spin grid-cols-[1fr,1fr] grid-rows-[1fr,1fr]",
        size === 6 && "gap-1 p-px s-6",
        size === 10 && "gap-1.5 p-0.5 s-10",
      )}
    >
      <div className="rounded-full bg-blue-200" />
      <div className="rounded-full bg-blue-400" />
      <div className="rounded-full bg-blue-400" />
      <div className="rounded-full bg-blue-200" />
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
