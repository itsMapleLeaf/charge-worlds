import { z } from "zod"

export const diceRollSchema = z.object({
  id: z.string(),
  intent: z.string(),
  resultType: z.enum(["highest", "lowest"]),
  dice: z.array(z.object({ sides: z.number(), result: z.number() })),
  rolledBy: z.string(),
})
export type DiceRoll = z.infer<typeof diceRollSchema>
