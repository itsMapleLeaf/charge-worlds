import { Emitter } from "../../helpers/emitter"

const worldEmitters = new Map<string, Emitter<"update">>()

export function getWorldEmitter(worldId: string) {
  let emitter = worldEmitters.get(worldId)
  if (!emitter) {
    emitter = new Emitter()
    worldEmitters.set(worldId, emitter)
  }
  return emitter
}
