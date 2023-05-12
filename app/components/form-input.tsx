import clsx from "clsx"
import { type ComponentPropsWithoutRef } from "react"
import { useField } from "remix-validated-form"
import { Field } from "~/components/field"

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
      <input {...props} className={clsx("input", props.className)} />
    </Field>
  )
}
