import { errorTextClass, labelTextClass } from "./styles"

export function Field({
  label,
  children,
  className,
  errors,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  errors?: string[]
}) {
  return (
    <label className={className}>
      <div className={labelTextClass}>{label}</div>
      {children}
      {!!errors?.length && (
        <div className="mt-2">
          {errors.map((error, i) => (
            <p key={i} className={errorTextClass}>
              {error}
            </p>
          ))}
        </div>
      )}
    </label>
  )
}
