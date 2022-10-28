import type { ReactNode } from "react"
import type { ZodType } from "zod"
import type { Auth } from "../auth/auth-context"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DashboardModuleContext = {
  auth: Auth
}

export type DashboardModule<State extends Json = Json, Event extends Json = Json> = {
  name: string
  description: string

  stateSchema: ZodType<State>
  initialState: State
  stateView?: (state: State, context: DashboardModuleContext) => State

  eventSchema: ZodType<Event>
  onEvent: (
    args: DashboardModuleEventArgs<State, Event>,
  ) => void | PromiseLike<unknown>

  render: (args: DashboardRenderArgs<State, Event>) => ReactNode
}

export type DashboardModuleEventArgs<State extends Json, Event extends Json> = {
  state: State
  event: Event
  setState: (state: State) => void
  updateState: (recipe: (state: State) => void) => void
}

export type DashboardRenderArgs<State extends Json, Event extends Json> = {
  context: DashboardModuleContext
  state: State
  send: (event: Event) => void
}

export function defineModule<State extends Json, Event extends Json>(
  definition: DashboardModule<State, Event>,
) {
  return definition
}
