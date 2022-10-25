import { z } from "zod"

export const clockSchema = z.object({
  id: z.string(),
  name: z.string(),
  progress: z.number(),
  maxProgress: z.number(),
})
