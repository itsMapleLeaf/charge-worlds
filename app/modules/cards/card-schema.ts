import { z } from "zod"

export const cardBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  hidden: z.boolean().default(true),
  data: z.record(z.any()).default({}),
})
export type CardBlock = z.output<typeof cardBlockSchema>

export const cardSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  blocks: z.array(cardBlockSchema).default([]),
  hidden: z.boolean().default(true),
})
export type Card = z.output<typeof cardSchema>
