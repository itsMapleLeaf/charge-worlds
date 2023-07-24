import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { css } from "styled-system/css"

export function Label({
  text,
  children,
  ...props
}: ComponentPropsWithoutRef<"label"> & { text: ReactNode }) {
  return (
    <label {...props}>
      <div className={css({ fontSize: "sm", fontWeight: "medium" })}>
        {text}
      </div>
      {children}
    </label>
  )
}
