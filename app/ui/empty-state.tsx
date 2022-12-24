import { type ReactNode } from "react"

export function EmptyState(props: { title?: ReactNode; children?: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-screen-md py-16 px-4 text-center">
      {!!props.title && (
        <h2 className="mb-2 text-4xl font-light opacity-50">{props.title}</h2>
      )}
      {!!props.children && (
        <div className="text-lg font-light">{props.children}</div>
      )}
    </section>
  )
}
