import { Link } from "@remix-run/react"
import { LogIn, Zap } from "lucide-react"
import type { ReactNode } from "react"
import { Fragment } from "react"
import { route } from "routes-gen"
import { UserMenuButton } from "~/modules/auth/user-menu-button"
import { AuthGuard } from "./auth"

type AppHeaderProps = {
  title: string
  breadcrumbs: Array<{ label: ReactNode; to: string }>
}

export function AppHeader({ title, breadcrumbs }: AppHeaderProps) {
  return (
    <header>
      <nav className="flex items-center">
        <div className="flex flex-1 flex-wrap items-start gap-1.5 text-lg font-light leading-tight">
          <Link to="/" className="flex items-center gap-1 anchor">
            <Zap className="s-5" /> Charge Worlds
          </Link>

          {breadcrumbs?.map(({ label, to }) => (
            <Fragment key={to}>
              <span className="opacity-50" aria-hidden>
                /
              </span>
              <Link to={to} className="anchor">
                {label}
              </Link>
            </Fragment>
          ))}
        </div>

        <div className="ml-auto self-start">
          <AuthGuard
            fallback={
              <Link
                to={route("/auth/discord/login")}
                className="border-0 bg-transparent button"
              >
                <LogIn /> Sign in with Discord
              </Link>
            }
          >
            {({ user }) => <UserMenuButton user={user} />}
          </AuthGuard>
        </div>
      </nav>

      <h1 className="float-left text-3xl font-light">{title}</h1>
    </header>
  )
}
