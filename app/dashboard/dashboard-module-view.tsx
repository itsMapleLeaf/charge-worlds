import { useStore } from "@nanostores/react"
import produce from "immer"
import { atom, computed } from "nanostores"
import { useCallback, useContext, useEffect, useMemo, useRef } from "react"
import type { Socket } from "socket.io-client"
import { connect } from "socket.io-client"
import { AuthContext } from "../auth/auth-context"
import type {
  DashboardModule,
  DashboardRenderArgs,
  Json,
} from "./dashboard-module"
import type { ClientToServerEvents, ServerToClientEvents } from "./socket-types"

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

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
  worldId,
}: {
  moduleId: string
  module: DashboardModule<Json, Json>
  worldId: string
}) {
  const [state = module.initialState, setState] = useModuleState(moduleId)
  const auth = useContext(AuthContext)
  const socketRef = useRef<AppSocket>()

  useEffect(() => {
    const socket = (socketRef.current = connect({
      query: { worldId },
      transports: ["websocket"],
    }))

    socket.on(`moduleState:${moduleId}`, setState)
    socket.on("socketError", console.error)

    socket.emit("getModuleState", moduleId)

    return () => {
      socket.disconnect()
    }
  }, [moduleId, setState, worldId])

  const renderArgs: DashboardRenderArgs<Json, Json> = {
    context: { auth },
    state,
    send: (event) => {
      socketRef.current?.emit("moduleAction", moduleId, event)
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
