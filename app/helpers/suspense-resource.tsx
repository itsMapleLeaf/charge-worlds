export type SuspenseResource<Data> = ReturnType<
  typeof createSuspenseResource<Data>
>

export function createSuspenseResource<Input>(promise: Input) {
  type State =
    | { type: "loading" }
    | { type: "loaded"; data: Awaited<Input> }
    | { type: "error"; error: unknown }

  let state: State = { type: "loading" }
  Promise.resolve(promise).then(
    (data) => (state = { type: "loaded", data }),
    (error: unknown) => (state = { type: "error", error }),
  )

  return {
    read: () => {
      if (state.type === "loading") throw promise
      if (state.type === "error") throw state.error
      return state.data
    },
  }
}
