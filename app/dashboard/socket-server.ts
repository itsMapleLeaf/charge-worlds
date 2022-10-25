import produce from "immer"
import type * as http from "node:http"
import { Server } from "socket.io"
import { db } from "../core/db.server"
import type { DashboardModuleEventArgs, Json } from "./dashboard-module"
import { dashboardModuleLibrary } from "./dashboard-module-library"
import type { ClientToServerEvents, ServerToClientEvents } from "./socket-types"

export function createSocketServer(httpServer: http.Server) {
  const socketServer = new Server<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
  )

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

      client.emit(`moduleState:${moduleId}`, stateResult.data)
    })

    client.on("moduleAction", async (moduleId, action) => {
      const module = dashboardModuleLibrary[moduleId]
      if (!module) {
        client.emit("socketError", "Module not found")
        console.error("Module not found", moduleId)
        return
      }

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

      const eventResult = module.eventSchema.safeParse(action)
      if (!eventResult.success) {
        client.emit("socketError", "Invalid action")
        console.error("Invalid action", action, eventResult.error, moduleId)
        return
      }

      let state = stateResult.data
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

      for (const [id, other] of socketServer.of("/").sockets) {
        if (id === client.id) continue
        other.emit(`moduleState:${moduleId}`, state)
      }

      await db.module.upsert({
        where: { id: moduleId },
        update: { state },
        create: { id: moduleId, state },
      })
    })
  })
}
