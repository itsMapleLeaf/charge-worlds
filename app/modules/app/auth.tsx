import { createContext, useContext } from "react"
import type { Nullish } from "~/helpers/types"

export type AuthContextUser = {
  id: string
  name: string
  avatarUrl?: Nullish<string>
}

const UserContext = createContext<AuthContextUser | undefined>(undefined)

export function AuthProvider({
  user,
  children,
}: {
  user?: AuthContextUser
  children: React.ReactNode
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useAuthContext() {
  return { user: useContext(UserContext) }
}

export function AuthGuard({
  children,
  fallback,
}: {
  children: (context: { user: AuthContextUser }) => React.ReactNode
  fallback: React.ReactNode
}) {
  const context = useAuthContext()
  return <>{context.user ? children({ user: context.user }) : fallback}</>
}
