import * as RemixReact from "@remix-run/react"
import type { ActionArgs, TypedResponse } from "@vercel/remix"
import type { ComponentProps } from "react"
import { useMemo } from "react"
import type * as z from "zod"
import type { ZodRawShape } from "zod"
import { ZodEffects, ZodObject, ZodString } from "zod"
import { autoRef } from "./react"

type OnlyString<T> = T extends string ? T : never
type Merge<A, B> = Omit<A, keyof B> & B

export class ActionRouter<Context> {
  private readonly routes: Array<ActionRoute<Context>> = []

  route<FormInput extends object, FormParsed, Output>(
    name: string,
    config: {
      input?: z.ZodType<FormParsed, z.ZodTypeDef, FormInput>
      callback: (input: FormParsed, context: Context) => Promise<Output>
    },
  ) {
    const route = new ActionRoute(name, config)
    this.routes.push(route as unknown as ActionRoute<Context>)
    return route
  }

  async handle(
    args: ActionArgs,
    context: Context,
    redirectTo?: string,
  ): Promise<TypedResponse<unknown>> {
    for (const route of this.routes) {
      const response = await route.handle(args, context, redirectTo)
      if (response) return response
    }
    return new Response(undefined, { status: 404 })
  }
}

export class ActionRoute<
  Context = unknown,
  FormInput extends object = object,
  FormParsed = unknown,
  Output = unknown,
> {
  readonly __fieldNames!: OnlyString<keyof FormInput>

  constructor(
    readonly name: string,
    readonly config: {
      input?: z.ZodType<FormParsed, z.ZodTypeDef, FormInput>
      callback: (input: FormParsed, context: Context) => Promise<Output>
    },
  ) {}

  async handle(
    args: ActionArgs,
    context: Context,
    redirectTo: string | undefined,
  ): Promise<TypedResponse<ActionRouteData<Output>> | undefined> {
    const { json, redirect } = await import("@vercel/remix")

    const formData = await args.request.clone().formData()
    const actionName = formData.get("actionName")
    if (actionName !== this.name) return

    const inputResult = this.config.input?.safeParse(formData)
    if (inputResult && !inputResult.success) {
      const { formErrors, fieldErrors } = inputResult.error.formErrors
      return json(
        { __actionName: this.name, errors: formErrors, fieldErrors },
        400,
      )
    }

    const data = await this.config.callback(
      inputResult?.data as FormParsed,
      context,
    )
    if (redirectTo === undefined) {
      return json({ __actionName: this.name, data })
    }

    return redirect(redirectTo)
  }
}

type ActionRouteData<Data> = {
  __actionName: string
  errors?: string[]
  fieldErrors?: Record<string, string[] | undefined>
  data?: Data
}

export function useActionUi<FormInput extends object, Data>(
  route: ActionRoute<unknown, FormInput, unknown, Data>,
  actionData: ActionRouteData<unknown> | undefined,
) {
  const Form = useMemo(() => {
    return autoRef(function Form({
      children,
      ...props
    }: Partial<RemixReact.FormProps>) {
      return (
        <RemixReact.Form method="post" {...props}>
          <input type="hidden" name="actionName" value={route.name} />
          {children}
        </RemixReact.Form>
      )
    })
  }, [route.name])

  const Input = useMemo(() => {
    return autoRef(
      (
        props: Merge<
          ComponentProps<"input">,
          { name: OnlyString<keyof FormInput> }
        >,
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
          route.config.input && extractZodObject(route.config.input)
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
  }, [route.config.input])

  const HiddenInput = useMemo(() => {
    return autoRef(function HiddenInput(
      props: Merge<
        ComponentProps<"input">,
        {
          name: OnlyString<keyof FormInput>
          value: string | number | readonly string[]
        }
      >,
    ) {
      return <input type="hidden" {...props} />
    })
  }, [])

  return {
    Form,
    Input,
    HiddenInput,
    data:
      actionData?.__actionName === route.name
        ? (actionData as Data)
        : undefined,
    errors:
      actionData?.__actionName === route.name ? actionData.errors : undefined,
    fieldErrors:
      actionData?.__actionName === route.name
        ? (actionData.fieldErrors as Record<
            OnlyString<keyof FormInput>,
            string[]
          >)
        : undefined,
  }
}

function extractZodString(schema: z.ZodTypeAny): ZodString | undefined {
  if (schema instanceof ZodString) return schema
  if (schema instanceof ZodEffects)
    return extractZodString(schema.innerType() as z.ZodTypeAny)
  return undefined
}

function extractZodObject(
  schema: z.ZodTypeAny,
): ZodObject<ZodRawShape> | undefined {
  if (schema instanceof ZodObject) return schema
  if (schema instanceof ZodEffects)
    return extractZodObject(schema.innerType() as z.ZodTypeAny)
  return undefined
}
