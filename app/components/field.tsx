export function Field({
  label,
  children,
  className,
  errors,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
  errors?: string | string[]
}) {
  return (
    <label className={className}>
      <div className="label">{label}</div>
      {!!errors?.length && (
        <div className="mt-2">
          {[errors].flat().map((error, i) => (
            <p key={i} className="text-red-400">
              {error}
            </p>
          ))}
        </div>
      )}
      <div className="h-2" />
      {children}
    </label>
  )
}
