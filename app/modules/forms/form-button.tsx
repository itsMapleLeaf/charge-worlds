import { useIsSubmitting } from "remix-validated-form"
import { LoadingSpinner } from "~/modules/ui/loading"

export function FormButton(props: React.ComponentProps<"button">) {
  const isSubmitting = useIsSubmitting()
  return (
    <button type="submit" className="button" {...props}>
      {isSubmitting ? <LoadingSpinner size="small" /> : props.children}
    </button>
  )
}
