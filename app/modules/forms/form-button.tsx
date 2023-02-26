import { useIsSubmitting } from "remix-validated-form"
import { button } from "~/modules/ui/button"
import { LoadingSpinner } from "~/modules/ui/loading"

export function FormButton(props: React.ComponentProps<"button">) {
  const isSubmitting = useIsSubmitting()
  return (
    <button type="submit" className={button()} {...props}>
      {isSubmitting ? <LoadingSpinner /> : props.children}
    </button>
  )
}
