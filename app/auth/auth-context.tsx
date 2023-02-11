import type { Role } from "@prisma/client"
import { createContext } from "react"

export type Auth = {
  user?: { name: string; avatarUrl: string | null }
  membership?: { role: Role }
}

export const AuthContext = createContext<Auth>({})
