import type { ActionArgs, TypedResponse } from "@remix-run/node"
import type { z, ZodType, ZodTypeDef } from "zod"
import { ZodString } from "zod"
import { assert } from "./assert"
import { raise } from "./errors"
import { mapValues } from "./object"

type FormFieldSchema = ZodType<unknown, ZodTypeDef, string>
type FormFieldRecord = Record<string, FormFieldSchema>

type FormActionFn<Fields extends FormFieldRecord> = (
  values: {
    [K in keyof Fields]: z.output<Fields[K]>
  },
  actionArgs: ActionArgs,
) => void | Promise<unknown>

type FormAction<Fields extends FormFieldRecord = FormFieldRecord> = ReturnType<
  typeof defineFormAction<Fields>
>

export function defineFormAction<Fields extends FormFieldRecord>(args: {
  fields: Fields
  action: FormActionFn<Fields>
}) {
  const fieldHelpers = mapValues(args.fields, (schema, name) => ({
    schema,
    input: getFieldInputProps(name as string, schema),
    hidden: (value: z.output<Fields[keyof Fields]>) => ({
      type: "hidden" as const,
      name,
      value,
    }),
  }))

  return {
    fields: fieldHelpers,
    action: args.action,
  }
}

export type FormActionGroupResponse<
  Actions extends Record<string, FormAction<any>>,
> = {
  [K in keyof Actions]: {
    hasErrors: boolean
    data?: Awaited<ReturnType<Actions[K]["action"]>>
    fieldErrors?: Record<string, string[]>
    globalError?: string
  }
}

export function defineFormActionGroup<
  Actions extends Record<string, FormAction<any>>,
>(actions: Actions) {
  async function handleSubmit(
    args: ActionArgs,
    redirectTo?: string,
  ): Promise<TypedResponse<FormActionGroupResponse<Actions>>> {
    const { json, redirect } = await import("@remix-run/node")

    const body = Object.fromEntries(await args.request.formData())
    assert(typeof body.actionType === "string", "Missing actionType")

    const action = actions[body.actionType]
    assert(action, `Unknown actionType: ${body.actionType}`)

    const valueResults = mapValues(action.fields, (field, name) => {
      return field.schema.safeParse(body[name as string])
    })

    const errors = mapValues(valueResults, (result) => {
      return result.success ? [] : result.error.formErrors.formErrors
    })

    if (Object.values(errors).some((e) => e.length > 0)) {
      return json(
        { [body.actionType]: { hasErrors: true, fieldErrors: errors } },
        { status: 400 },
      )
    }

    const values = mapValues(valueResults, (result) =>
      result.success
        ? result.data
        : raise("Unexpected error: failed to parse form values"),
    )

    try {
      const data = await action.action(values, args)
      if (redirectTo) {
        return redirect(redirectTo)
      }

      return json({
        [body.actionType]: { hasErrors: false, data },
      })
    } catch (error) {
      console.error(error)
      return json(
        {
          [body.actionType]: {
            hasErrors: true,
            globalError: "An unexpected error occurred",
          },
        },
        { status: 400 },
      )
    }
  }

  return {
    actions,
    types: mapValues(actions, (_, name) => ({
      type: "hidden" as const,
      name: "actionType" as const,
      value: name,
    })),
    handleSubmit,
  }
}

export type FieldProps = {
  name: string
  type?: "url" | "email"
  required?: boolean
  minLength?: number
  maxLength?: number
}

function getFieldInputProps(
  name: string,
  schema: ZodType<unknown, ZodTypeDef, string>,
): FieldProps {
  if (!(schema instanceof ZodString)) {
    return {
      name,
      required: !schema.isOptional(),
    }
  }

  return {
    name,
    type: schema.isEmail ? "email" : schema.isURL ? "url" : undefined,
    required: !schema.isOptional(),
    minLength: schema.minLength ?? undefined,
    maxLength: schema.maxLength ?? undefined,
  }
}
