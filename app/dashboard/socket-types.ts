import type { Json } from "./dashboard-module"

export type ServerToClientEvents = {
  socketError: (message: string) => void
} & {
  [_ in `moduleState:${string}`]: (state: Json) => void
}

export type ClientToServerEvents = {
  getModuleState: (moduleId: string) => void
  moduleAction: (moduleId: string, action: Json) => void
}
