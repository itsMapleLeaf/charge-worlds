import { useNavigation } from "@remix-run/react"

export function usePendingSubmit() {
  const navigation = useNavigation()
  const submitting = navigation.state === "submitting"
  const loadingAfterAction =
    navigation.state === "loading" && !!navigation.formData
  return submitting || loadingAfterAction
}
