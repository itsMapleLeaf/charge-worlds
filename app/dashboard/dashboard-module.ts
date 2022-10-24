import type { ReactNode } from "react"
import type { ZodType } from "zod"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DashboardModule<State extends Json, Event extends Json> = {
  name: string
  stateSchema: ZodType<State>
  initialState: State
  eventSchema: ZodType<Event>
  onEvent: (context: DashboardModuleEventArgs<State, Event>) => void
  render: (context: DashboardRenderArgs<State, Event>) => ReactNode
}

export type DashboardModuleEventArgs<State extends Json, Event extends Json> = {
  state: State
  event: Event
  setState: (state: State) => void
  updateState: (recipe: (state: State) => void) => void
}

export type DashboardRenderArgs<State extends Json, Event extends Json> = {
  state: State
  send: (event: Event) => void
}

export function defineModule<State extends Json, Event extends Json>(
  definition: DashboardModule<State, Event>,
): DashboardModule<State, Event> {
  return definition
}
