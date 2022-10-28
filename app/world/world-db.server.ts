import { db } from "../core/db.server"

export const defaultWorldId = "default"

export function getDefaultWorld() {
  return db.world.upsert({
    where: { id: defaultWorldId },
    update: {},
    create: { id: defaultWorldId, name: "New world" },
  })
}
