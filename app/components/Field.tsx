import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { cx } from "../../styled-system/css"
import { flex } from "../../styled-system/patterns"
import { Label } from "./Label"

type FieldProps = ComponentPropsWithoutRef<"div"> & {
  label?: ReactNode
  inputId?: string
}

export function Field({
  children,
  className,
  label,
  inputId,
  ...props
}: FieldProps) {
  return (
    <div {...props} className={cx(flex({ direction: "column" }), className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      {children}
    </div>
  )
}
