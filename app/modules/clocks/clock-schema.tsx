import { z } from "zod"

export type ClockInput = z.input<typeof clockSchema>
export type ClockOutput = z.output<typeof clockSchema>

export const clockSchema = z.object({
  name: z.string().default(""),
  progress: z.number().default(0),
  maxProgress: z.number().default(4),
})
