import { db } from "~/core/db.server"
import { liveblocksFetch } from "~/liveblocks/liveblocks-api.server"

export async function createWorldSnapshot(world: { id: string; name: string }) {
  const response = await liveblocksFetch(
    "GET",
    `/rooms/world:${world.id}/storage`,
  )

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    throw new Error(
      `Failed to get room storage: (${response.status}) ${response.statusText}`,
    )
  }

  const dataText = await response.text()
  const data = JSON.parse(dataText)

  await db.worldSnapshot.create({
    data: {
      worldId: world.id,
      name: world.name,
      data,
    },
  })

  const snapshotCount = await db.worldSnapshot.count({
    where: { worldId: world.id },
  })

  if (snapshotCount > 10) {
    const snapshots = await db.worldSnapshot.findMany({
      where: { worldId: world.id },
      orderBy: { createdAt: "asc" },
      take: snapshotCount - 10,
      select: { id: true },
    })
    await db.worldSnapshot.deleteMany({
      where: { id: { in: snapshots.map((s) => s.id) } },
    })
  }

  return { size: dataText.length }
}
