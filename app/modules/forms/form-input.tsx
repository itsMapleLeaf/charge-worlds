import { cx } from "class-variance-authority"
import { type ComponentPropsWithoutRef } from "react"
import { useField } from "remix-validated-form"
import { Field } from "~/modules/ui/field"
import { input } from "~/modules/ui/input"

export function FormInput({
  label,
  ...props
}: ComponentPropsWithoutRef<"input"> & {
  label: string
  name: string
}) {
  const field = useField(props.name)
  return (
    <Field label={label} errors={field.error}>
      <input {...props} className={cx(input(), props.className)} />
    </Field>
  )
}
