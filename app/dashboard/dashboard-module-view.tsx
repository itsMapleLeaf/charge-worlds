import produce from "immer"
import { useEffect, useState } from "react"
import type { Socket } from "socket.io-client"
import { connect } from "socket.io-client"
import type {
  DashboardModule,
  DashboardRenderArgs,
  Json,
} from "./dashboard-module"
import type { ClientToServerEvents, ServerToClientEvents } from "./socket-types"

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
const getSocket = () => {
  if (!socket) {
    socket = connect({ transports: ["websocket"] })
    socket.on("socketError", console.error)
  }
  return socket
}

export function DashboardModuleView({
  moduleId,
  module,
}: {
  moduleId: string
  module: DashboardModule<any, any>
}) {
  const [state, setState] = useState(module.initialState)

  useEffect(() => {
    getSocket().emit("getModuleState", moduleId)
  }, [moduleId])

  useEffect(() => {
    const socket = getSocket()
    const handler = setState
    socket.on(`moduleState:${moduleId}`, handler)
    return () => {
      socket.off(`moduleState:${moduleId}`, handler)
    }
  }, [moduleId])

  const renderArgs: DashboardRenderArgs<Json, Json> = {
    state,
    send: (event) => {
      getSocket().emit("moduleAction", moduleId, event)
      void module.onEvent({
        state,
        event,
        setState,
        updateState: (recipe) => setState(produce(state, recipe)),
      })
    },
  }

  return <>{module.render(renderArgs)}</>
}
