import type { ComponentPropsWithoutRef, ReactNode } from "react"

export function ExternalLink({
  children,
  ...props
}: ComponentPropsWithoutRef<"a"> & { href: string; children: ReactNode }) {
  return (
    <a target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  )
}
