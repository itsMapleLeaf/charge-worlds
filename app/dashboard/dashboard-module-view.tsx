import { useStore } from "@nanostores/react"
import produce from "immer"
import { atom, computed } from "nanostores"
import { useCallback, useContext, useEffect, useMemo } from "react"
import type { Socket } from "socket.io-client"
import { connect } from "socket.io-client"
import { AuthContext } from "../auth/auth-context"
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

const moduleStateMap = atom<Record<string, Json>>({})

function useModuleState(moduleId: string) {
  const state = useStore(
    useMemo(
      () => computed(moduleStateMap, (state) => state[moduleId]),
      [moduleId],
    ),
  )

  const setState = useCallback(
    (newState: Json) => {
      moduleStateMap.set({
        ...moduleStateMap.get(),
        [moduleId]: newState,
      })
    },
    [moduleId],
  )

  return [state, setState] as const
}

export function DashboardModuleView({
  moduleId,
  module,
}: {
  moduleId: string
  module: DashboardModule<Json, Json>
}) {
  const [state = module.initialState, setState] = useModuleState(moduleId)
  const auth = useContext(AuthContext)

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
  }, [moduleId, setState])

  const renderArgs: DashboardRenderArgs<Json, Json> = {
    context: { auth },
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
