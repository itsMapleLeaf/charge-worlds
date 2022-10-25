import cuid from "cuid"
import { z } from "zod"
import { defineModule } from "../dashboard/dashboard-module"
import { CharacterManager } from "./character-manager"
import { characterSchema } from "./character-schema"

export const charactersModule = defineModule({
  name: "Characters",
  description: "Manage your characters",

  stateSchema: z.object({ characters: z.array(characterSchema) }),
  initialState: { characters: [] },

  eventSchema: z.union([
    z.object({ type: z.literal("add"), name: z.string() }),
    z.object({ type: z.literal("remove"), id: z.string() }),
    z.object({
      type: z.literal("update"),
      id: z.string(),
      data: characterSchema.partial(),
    }),
  ]),

  onEvent: ({ event, updateState }) => {
    if (event.type === "add") {
      updateState((state) => {
        state.characters.push({
          id: cuid(),
          name: event.name,
          group: "",
          concept: "",
          appearance: "",
          ties: "",
          momentum: 0,
          stress: 0,
          condition: "",
          actionLevels: {},
          talents: "",
          hidden: false,
        })
      })
    }

    if (event.type === "remove") {
      updateState((state) => {
        state.characters = state.characters.filter(
          (character) => character.id !== event.id,
        )
      })
    }

    if (event.type === "update") {
      updateState((state) => {
        const character = state.characters.find(
          (character) => character.id === event.id,
        )
        if (!character) return
        Object.assign(character, event.data)
      })
    }
  },

  render: ({ state: { characters }, send }) => (
    <CharacterManager
      characters={characters}
      onAdd={(name) => send({ type: "add", name })}
      onRemove={(id) => send({ type: "remove", id })}
      onUpdate={(id, data) => send({ type: "update", id, data })}
    />
  ),
})
