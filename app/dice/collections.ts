import { z } from "zod"
import { defineLiveblocksListCollection } from "~/liveblocks/collection"

const diceRollSchema = z.object({
  intent: z.string().max(50_000).default(""),
  dice: z.array(z.object({ sides: z.number().int(), value: z.number().int() })),
  resultType: z.enum(["highest", "lowest"]),
  rolledBy: z.string(),
  rolledAt: z.string(),
})
export type DiceRoll = z.output<typeof diceRollSchema>

export const DiceRollCollection = defineLiveblocksListCollection(
  "diceRolls",
  diceRollSchema,
)
