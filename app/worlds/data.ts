export type World = {
  id: string
  name: string
}

const worlds: World[] = [
  { id: "1", name: "one" },
  { id: "2", name: "really really really long world name" },
  { id: "3", name: "Hi Mom" },
  { id: "4", name: "testing" },
]

export async function getWorlds() {
  return worlds
}

export async function findWorld(id: string) {
  return worlds.find((world) => world.id === id)
}

export async function createWorld() {
  const world = {
    id: String(worlds.length + 1),
    name: "New World",
  }
  worlds.push(world)
  return world
}

export async function updateWorld(id: string, data: { name: string }) {
  const world = worlds.find((world) => world.id === id)
  if (world) Object.assign(world, data)
  return world
}
