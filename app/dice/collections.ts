import { z } from "zod"
import { defineLiveblocksListCollection } from "~/liveblocks/collection"

export const diceSchema = z.array(
  z.object({ sides: z.number().int(), result: z.number().int() }),
)

const diceRollSchema = z.object({
  intent: z.string().max(50_000).default(""),
  dice: diceSchema,
  resultType: z.enum(["highest", "lowest"]),
  rolledBy: z.string(),
  rolledAt: z.string(),
})
export type DiceRoll = z.output<typeof diceRollSchema>
export type DiceRollInput = z.output<typeof diceRollSchema>

export const DiceRollCollection = defineLiveblocksListCollection(
  "diceRolls",
  diceRollSchema,
)
