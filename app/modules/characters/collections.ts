import { z } from "zod"
import {
  defineLiveblocksListCollection,
  defineLiveblocksMapCollection,
} from "~/modules/liveblocks/collection"

const characterSchema = z.object({
  name: z.string().max(128).default("New character"),
  momentum: z.number().int().default(2),
  stress: z.number().int().default(0),
  condition: z.string().max(50_000).default(""),
  fieldValues: z.record(z.string().max(50_000)).default({}),
  actionLevels: z.record(z.number()).default({}),
  hidden: z.boolean().default(true),
  color: z.string().optional(),
  imageUrl: z.string().optional(),
})
export type Character = z.output<typeof characterSchema>
export type CharacterInput = z.input<typeof characterSchema>

export const CharacterCollection = defineLiveblocksMapCollection(
  "characters",
  characterSchema,
)

const characterFieldSchema = z.object({
  id: z.string(),
  name: z.string().max(128).default("New field"),
  description: z.string().max(50_000).default(""),
  isLong: z.boolean().default(false),
})
export type CharacterField = z.output<typeof characterFieldSchema>
export type CharacterFieldInput = z.input<typeof characterFieldSchema>

export const CharacterFieldCollection = defineLiveblocksListCollection(
  "characterFields",
  characterFieldSchema,
)
