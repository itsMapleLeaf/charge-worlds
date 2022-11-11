import { z } from "zod"
import { Emitter } from "../../helpers/emitter"

export const worldEventSchema = z.object({
  type: z.literal("update"),
  sourceUserId: z.string(),
})
export type WorldEvent = z.infer<typeof worldEventSchema>

declare global {
  var worldEmittersGlobal: Map<string, Emitter<WorldEvent>> | undefined
}

const worldEmitters = (globalThis.worldEmittersGlobal ??= new Map<
  string,
  Emitter<WorldEvent>
>())

export function getWorldEmitter(worldId: string) {
  let emitter = worldEmitters.get(worldId)
  if (!emitter) {
    emitter = new Emitter()
    worldEmitters.set(worldId, emitter)
  }
  return emitter
}

export function emitWorldUpdate(worldId: string, sourceUserId: string) {
  getWorldEmitter(worldId).emit({
    type: "update",
    sourceUserId,
  })
}
