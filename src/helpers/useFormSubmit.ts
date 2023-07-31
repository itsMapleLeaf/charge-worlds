import type { ZodType, ZodTypeDef } from "zod"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"

export function useFormSubmit<SubmitData, SubmitResult>(options: {
  schema: ZodType<
    SubmitData,
    ZodTypeDef,
    Iterable<[string, FormDataEntryValue]>
  >
  onSubmit: (data: SubmitData) => SubmitResult
}) {
  return useAsyncCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = options.schema.parse(new FormData(event.currentTarget))
    return options.onSubmit(data)
  })
}
