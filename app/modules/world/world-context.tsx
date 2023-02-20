import type { Role } from "@prisma/client"
import { createContextWrapper } from "~/helpers/context"
import type { Nullish } from "~/helpers/types"

export const WorldContext = createContextWrapper(
  function useWorldProvider(props: {
    world: {
      id: string
      name: string
      memberships: Array<{
        role: Role
        user: {
          id: string
          name: string
          avatarUrl?: Nullish<string>
        }
      }>
    }
    membership?: {
      role: Role
    }
  }) {
    return {
      ...props,
      isPlayer: props.membership?.role === "PLAYER",
      isOwner: props.membership?.role === "OWNER",
      isMember: !!props.membership,
      isSpectator: !props.membership,
    }
  },
)
