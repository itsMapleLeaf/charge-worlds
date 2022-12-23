import { type ReactNode } from "react"

export function EmptyState(props: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="p-16 text-center">
      <h2 className="text-4xl font-light opacity-50 mb-2">{props.title}</h2>
      <div className="text-lg font-light">{props.children}</div>
    </section>
  )
}
