import { ZodError, type ZodType, type ZodTypeDef } from "zod"
import { useAsyncCallback } from "~/helpers/useAsyncCallback"

export function useFormSubmit<SubmitData, SubmitResult>(options: {
	schema: ZodType<
		SubmitData,
		ZodTypeDef,
		Iterable<[string, FormDataEntryValue]>
	>
	onSubmit: (
		data: SubmitData,
		event: React.FormEvent<HTMLFormElement>,
	) => SubmitResult
}) {
	return useAsyncCallback(async (event: React.FormEvent<HTMLFormElement>) => {
		try {
			event.preventDefault()
			const data = options.schema.parse(new FormData(event.currentTarget))
			return await options.onSubmit(data, event)
		} catch (error) {
			if (error instanceof ZodError) {
				const flattenedError = error.flatten()

				const fieldErrorList = Object.values(flattenedError.fieldErrors)
					.filter(Boolean)
					.flat()

				const errorList = [...flattenedError.formErrors, ...fieldErrorList]

				throw new Error(errorList.join("\n"), { cause: error })
			}
			throw error
		}
	})
}
