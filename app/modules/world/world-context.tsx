import { createContextWrapper } from "~/helpers/context"
import type { Nullish } from "~/helpers/types"

export const WorldContext = createContextWrapper(
  function useWorldProvider(props: {
    world: {
      name: string
      memberships: Array<{
        user: {
          id: string
          name: string
          avatarUrl?: Nullish<string>
        }
      }>
    }
  }) {
    return props
  },
)
