import { z } from "zod"

export const cardBlockSchema = z.union([
  z.object({
    id: z.string(),
    type: z.literal("text"),
    text: z.string(),
    hidden: z.boolean().default(true),
  }),
  z.object({
    id: z.string(),
    type: z.literal("image"),
    src: z.string(),
    hidden: z.boolean().default(true),
  }),
])
type CardBlockOutput = z.output<typeof cardBlockSchema>
export type CardBlockType = CardBlockOutput["type"]
export type CardBlock<Type extends CardBlockType = CardBlockType> = Extract<
  CardBlockOutput,
  { type: Type }
>

export const cardSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  blocks: z.array(cardBlockSchema).default([]),
  hidden: z.boolean().default(true),
})
export type Card = z.output<typeof cardSchema>
