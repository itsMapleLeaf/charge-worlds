import type { ActionArgs, TypedResponse } from "@remix-run/node"
import type { z, ZodType, ZodTypeDef } from "zod"
import { ZodString } from "zod"
import { assert } from "./assert"
import { raise } from "./errors"
import { mapValues } from "./object"

type FormFieldSchema = ZodType<unknown, ZodTypeDef, string | undefined>
type FormFieldRecord = Record<string, FormFieldSchema>

type FormActionFn<Fields extends FormFieldRecord> = (
  values: {
    [K in keyof Fields]: z.output<Fields[K]>
  },
  actionArgs: ActionArgs,
) => void | Promise<unknown>

export class FormAction<Fields extends FormFieldRecord = FormFieldRecord> {
  constructor(
    private readonly args: { fields: Fields; action: FormActionFn<Fields> },
  ) {}

  get action() {
    return this.args.action
  }

  get fields() {
    return mapValues(this.args.fields, (schema, name) => ({
      schema,
      input: getFieldInputProps(name as string, schema),
      hidden: (value: z.input<Fields[keyof Fields]>) => ({
        type: "hidden" as const,
        name,
        value,
      }),
    }))
  }

  // eslint-disable-next-line class-methods-use-this
  formData(
    values: UndefinedToOptional<{ [K in keyof Fields]: z.input<Fields[K]> }>,
  ) {
    const formData = new FormData()
    for (const [name, value] of Object.entries(values)) {
      if (typeof value === "string") {
        formData.append(name, value)
      }
    }
    return formData
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

export class FormActionGroup<Actions extends Record<string, FormAction<any>>> {
  constructor(readonly actions: Actions) {}

  get types() {
    return mapValues(this.actions, (_, name) => ({
      type: "hidden" as const,
      name: "actionType" as const,
      value: name,
    }))
  }

  formData<K extends Extract<keyof Actions, string>>(
    action: K,
    input: Parameters<Actions[K]["formData"]>[0],
  ) {
    const data = this.actions[action]!.formData(input)
    data.append("actionType", action)
    return data
  }

  async handleSubmit(
    args: ActionArgs,
    redirectTo?: string,
  ): Promise<TypedResponse<FormActionGroupResponse<Actions>>> {
    const { json, redirect } = await import("@remix-run/node")

    const body = Object.fromEntries(await args.request.formData())
    assert(typeof body.actionType === "string", "Missing actionType")

    const action = this.actions[body.actionType]
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
}

export type FieldProps = {
  name: string
  type?: "url" | "email"
  required?: boolean
  minLength?: number
  maxLength?: number
}

function getFieldInputProps(name: string, schema: FormFieldSchema): FieldProps {
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

type UndefinedToOptional<T extends object> = {
  [K in keyof T as undefined extends T[K] ? never : K]: Exclude<T[K], undefined>
} & {
  [K in keyof T as undefined extends T[K] ? K : never]?: Exclude<
    T[K],
    undefined
  >
}
