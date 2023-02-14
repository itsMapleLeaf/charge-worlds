import { createClient } from "@liveblocks/client"
import { createRoomContext } from "@liveblocks/react"

const client = createClient({
  authEndpoint: "/auth/liveblocks",
})

export const RoomContext = createRoomContext(client).suspense
