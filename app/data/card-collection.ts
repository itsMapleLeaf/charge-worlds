import { defineLiveblocksListCollection } from "~/data/liveblocks-collection"
import { cardSchema } from "./card-schema"

export const CardCollection = defineLiveblocksListCollection(
  "cards",
  cardSchema,
)
