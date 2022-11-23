import { createContext } from "react"
import type { Role } from "../../generated/prisma"

export type Auth = {
  user?: { name: string; avatarUrl: string | null }
  membership?: { role: Role }
}

export const AuthContext = createContext<Auth>({})
