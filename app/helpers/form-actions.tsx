import type { ActionArgs, TypedResponse } from "@remix-run/node"
import * as RemixReact from "@remix-run/react"
import type { ComponentProps } from "react"
import { useMemo } from "react"
import type * as z from "zod"
import type { ZodRawShape, ZodType } from "zod"
import { ZodEffects, ZodObject, ZodString } from "zod"
import { assert } from "./assert"
import { raise } from "./errors"
import { autoRef } from "./react"

type StringRecord = Record<string, string>
type OnlyString<T> = Extract<T, string>
type Merge<A, B> = Omit<A, keyof B> & B

type FormActionConfig = {
  input?: z.ZodType<unknown, z.ZodTypeDef, StringRecord>
  callback: (input: unknown, context: unknown) => unknown
  __fieldNames: string
}

type FormActionsData<ActionMap extends Record<string, FormActionConfig>> = {
  actions: {
    [K in keyof ActionMap]: {
      data?: Awaited<ReturnType<ActionMap[K]["callback"]>>
      errors?: string[]
      fieldErrors?: Record<string, string[]>
    }
  }
}

export class FormActions<
  ActionMap extends Record<string, FormActionConfig>,
  Context,
> {
  private constructor(private readonly actionMap: ActionMap) {}

  static create<Context>() {
    return new FormActions<{}, Context>({})
  }

  withAction<Name extends string, Input extends StringRecord, Output>(
    name: Name,
    args: {
      input?: z.ZodType<Output, z.ZodTypeDef, Input>
      callback: (values: Output, context: Context) => void | Promise<unknown>
    },
  ) {
    const { input, callback } = args

    const actions = {
      ...this.actionMap,
      [name]: { input, callback },
    } as ActionMap & {
      [K in Name]: typeof args & {
        // calculating this ahead of time is an optimization to keep typescript from choking
        __fieldNames: OnlyString<keyof Input>
      }
    }

    return new FormActions<typeof actions, Context>(actions)
  }

  async handleSubmit(
    args: ActionArgs,
    context: Context,
    redirectTo?: string,
  ): Promise<TypedResponse<FormActionsData<ActionMap>>> {
    const { json, redirect } = await import("@remix-run/node")

    const body = Object.fromEntries(await args.request.formData())
    const actionName = body.actionName
    assert(typeof actionName === "string", "Missing actionName")

    const action = this.actionMap[actionName]
    assert(action, `No action named ${actionName}`)

    const inputResult = action.input?.safeParse(body)
    if (inputResult && !inputResult.success) {
      const errors = inputResult.error.formErrors.formErrors
      const fieldErrors = inputResult.error.formErrors.fieldErrors
      return json(
        {
          errors,
          fieldErrors,
          actions: {
            [actionName]: { errors, fieldErrors },
          },
        },
        400,
      )
    }

    const data = await action.callback(inputResult?.data ?? {}, context)

    if (redirectTo) {
      return redirect(redirectTo)
    }

    return json({
      actions: {
        [actionName]: { data },
      },
    })
  }

  useUi = <ActionName extends OnlyString<keyof ActionMap>>(
    actionName: ActionName,
    actionData: FormActionsData<ActionMap> | undefined,
  ) => {
    const actionConfig =
      this.actionMap[actionName] ?? raise(`No action named ${actionName}`)

    const Form = useMemo(() => {
      return autoRef(function Form({
        children,
        ...props
      }: Partial<RemixReact.FormProps>) {
        return (
          <RemixReact.Form method="post" {...props}>
            <input type="hidden" name="actionName" value={actionName} />
            {children}
          </RemixReact.Form>
        )
      })
    }, [actionName])

    const Input = useMemo(() => {
      return autoRef(
        (
          props: ComponentProps<"input"> & {
            name: ActionMap[ActionName]["__fieldNames"]
          },
        ) => {
          const baseProps: {
            type: string
            name: string
            minLength?: number
            maxLength?: number
            required?: boolean
          } = {
            type: "text",
            name: props.name,
          }

          const zodObject =
            actionConfig.input && extractZodObject(actionConfig.input)
          const fieldSchema = zodObject?.shape[props.name]
          const zodString = fieldSchema && extractZodString(fieldSchema)

          if (zodString) {
            if (zodString.isEmail) baseProps.type = "email"
            if (zodString.isURL) baseProps.type = "url"
            baseProps.minLength = zodString.minLength ?? undefined
            baseProps.maxLength = zodString.maxLength ?? undefined
            baseProps.required = !fieldSchema.isOptional()
          }

          return <input {...baseProps} {...props} />
        },
      )
    }, [actionConfig.input])

    const HiddenInput = useMemo(() => {
      return autoRef(function HiddenInput(
        props: ComponentProps<"input"> & {
          name: ActionMap[ActionName]["__fieldNames"]
          value: string | number | readonly string[]
        },
      ) {
        return <input type="hidden" {...props} />
      })
    }, [])

    return {
      Form,
      Input,
      HiddenInput,
      errors: actionData?.actions[actionName]?.errors,
      fieldErrors: actionData?.actions[actionName]?.fieldErrors as Record<
        ActionMap[ActionName]["__fieldNames"],
        string[]
      >,
    }
  }
}

function extractZodString(schema: ZodType): ZodString | undefined {
  if (schema instanceof ZodString) return schema
  if (schema instanceof ZodEffects) return extractZodString(schema.innerType())
  return undefined
}

function extractZodObject(schema: ZodType): ZodObject<ZodRawShape> | undefined {
  if (schema instanceof ZodObject) return schema
  if (schema instanceof ZodEffects) return extractZodObject(schema.innerType())
  return undefined
}
