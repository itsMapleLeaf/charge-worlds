import type { Role } from "@prisma/client"
import { createContext, useContext } from "react"

export type Auth = {
  user?: { id: string; name: string; avatarUrl: string | null }
  membership?: { role: Role }
}

const AuthContext = createContext<Auth>({})

export const AuthProvider = AuthContext.Provider

export function useAuthContext() {
  const { user, membership } = useContext(AuthContext)
  return {
    user,
    isMember: membership != null,
    isSpectator: membership == null,
    isOwner: membership?.role === "OWNER",
    isPlayer: membership?.role === "PLAYER",
  }
}
