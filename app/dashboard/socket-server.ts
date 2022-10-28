import produce from "immer"
import type * as http from "node:http"
import type { Socket } from "socket.io"
import { Server } from "socket.io"
import type { Auth } from "../auth/auth-context"
import { getSessionUser } from "../auth/session"
import { db } from "../core/db.server"
import { getDefaultWorld } from "../world/world-db.server"
import type {
  DashboardModule,
  DashboardModuleEventArgs,
  Json,
} from "./dashboard-module"
import { dashboardModuleLibrary } from "./dashboard-module-library"
import type { ClientToServerEvents, ServerToClientEvents } from "./socket-types"

export function createSocketServer(httpServer: http.Server) {
  const socketServer = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
  )

  let actionQueues = new Map<string, Json[]>()
  let queueRunning = new Set<string>()

  async function addAction(
    client: Socket<ClientToServerEvents, ServerToClientEvents>,
    moduleId: string,
    queuedAction: Json,
  ) {
    const module = dashboardModuleLibrary[moduleId]
    if (!module) {
      client.emit("socketError", "Module not found")
      console.error("Module not found", moduleId)
      return
    }

    let queue = actionQueues.get(moduleId)
    if (!queue) {
      queue = []
      actionQueues.set(moduleId, queue)
    }

    queue.push(queuedAction)

    if (queueRunning.has(moduleId)) return
    queueRunning.add(moduleId)

    const moduleDb = await db.module.upsert({
      where: { id: moduleId },
      update: {},
      create: { id: moduleId, state: module.initialState },
    })

    const stateResult = module.stateSchema.safeParse(moduleDb.state)
    if (!stateResult.success) {
      client.emit("socketError", "Module state is invalid")
      console.error(
        `Module state is invalid: ${moduleId}`,
        stateResult.error,
        moduleDb.state,
      )
      return
    }

    let state = stateResult.data
    let action
    while ((action = queue.shift())) {
      try {
        const eventResult = module.eventSchema.safeParse(action)
        if (!eventResult.success) {
          client.emit("socketError", "Invalid action")
          console.error(
            "Invalid action",
            queuedAction,
            eventResult.error,
            moduleId,
          )
          continue
        }

        const onEventArgs: DashboardModuleEventArgs<Json, Json> = {
          state,
          event: eventResult.data,
          setState: (newState) => {
            state = newState
          },
          updateState: (recipe) => {
            state = produce(state, recipe)
          },
        }

        await module.onEvent(onEventArgs)
      } catch (error) {
        console.error("Error in action", error, moduleId, action)
      }
    }

    await db.module.upsert({
      where: { id: moduleId },
      update: { state },
      create: { id: moduleId, state },
    })

    queueRunning.delete(moduleId)

    await Promise.all(
      [...socketServer.of("/").sockets.values()].map((client) =>
        sendClientState(client, state, module, moduleId),
      ),
    )
  }

  async function sendClientState(
    client: Socket<ClientToServerEvents, ServerToClientEvents>,
    state: Json,
    module: DashboardModule<Json, Json>,
    moduleId: string,
  ) {
    let clientState = state
    if (module.stateView) {
      const auth = await getClientAuth(client)
      clientState = module.stateView(clientState, { auth })
    }
    client.emit(`moduleState:${moduleId}`, clientState)
  }

  async function getClientAuth(client: Socket): Promise<Auth> {
    const request = new Request(
      new URL(
        client.request.url!,
        `http://${client.request.headers.host ?? "0.0.0.0"}`,
      ),
    )
    for (const [key, value] of Object.entries(client.request.headers)) {
      if (Array.isArray(value)) {
        request.headers.append(key, value.join(","))
      } else if (typeof value === "string") {
        request.headers.append(key, value)
      }
    }

    const [world, user] = await Promise.all([
      getDefaultWorld(),
      getSessionUser(request),
    ])

    const membership =
      user &&
      (await db.membership.findUnique({
        where: {
          worldId_userDiscordId: {
            worldId: world.id,
            userDiscordId: user.discordId,
          },
        },
      }))

    return {
      user,
      membership: membership ?? undefined,
    }
  }

  socketServer.on("connection", (client) => {
    client.on("getModuleState", async (moduleId) => {
      const module = dashboardModuleLibrary[moduleId]
      if (!module) {
        client.emit("socketError", "Module not found")
        console.error(`Module not found: ${moduleId}`)
        return
      }

      const moduleDb = await db.module.upsert({
        where: { id: moduleId },
        create: { id: moduleId, state: module.initialState },
        update: {},
      })

      const stateResult = module.stateSchema.safeParse(moduleDb.state)
      if (!stateResult.success) {
        client.emit("socketError", "Module state is invalid")
        console.error(
          `Module state is invalid: ${moduleId}`,
          stateResult.error,
          moduleDb.state,
        )
        return
      }

      await sendClientState(client, stateResult.data, module, moduleId)
    })

    client.on("moduleAction", async (moduleId, action) => {
      void addAction(client, moduleId, action)
    })
  })
}
