import { z } from "zod"

const jsonSchema: z.ZodType<Json> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.lazy(() => z.array(jsonSchema)),
  z.lazy(() => z.record(jsonSchema)),
])

export const cardBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  hidden: z.boolean().default(true),
  data: z.record(jsonSchema).default({}),
})
export type CardBlock = z.output<typeof cardBlockSchema>

export const cardSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  titleHidden: z.boolean().default(false),
  blocks: z.array(cardBlockSchema).default([]),
  hidden: z.boolean().default(true),
})
export type Card = z.output<typeof cardSchema>
