import type { ReactNode } from "react"

export function SystemMessage({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-4">
      {children}
      <p className="opacity-75">{`(i'll make this less jank later)`}</p>
    </section>
  )
}
