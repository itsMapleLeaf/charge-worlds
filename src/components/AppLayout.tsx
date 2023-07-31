import { api } from "convex/_generated/api"
import { useQuery } from "convex/react"
import { LucideLogIn, LucideLogOut, LucideWrench } from "lucide-react"
import { Link, Outlet } from "react-router-dom"
import { $path } from "remix-routes"
import { css, cx } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"
import { button } from "../styles/button"
import { container } from "../styles/container"
import { Avatar } from "./Avatar"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./Menu"

export function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

function Header() {
  const user = null as {
    name: string
    avatar: string | null
    isAdmin: boolean
  } | null
  const world = useQuery(api.worlds.get)
  return (
    <header
      className={hstack({
        bg: "base.800",
        py: 3,
        shadow: "lg",
        borderBottomWidth: 1,
        borderColor: "base.700",
      })}
    >
      <div className={cx(container(), hstack())}>
        <div className={flex({ flex: 1, direction: "column", gap: 2 })}>
          <Link to={$path("/")}>
            <h1
              className={css({
                fontSize: "2xl",
                fontWeight: "light",
                lineHeight: 1,
              })}
            >
              {world?.name ?? "Loading..."}
            </h1>
          </Link>
          {user?.isAdmin && <HeaderNav />}
        </div>
        {user ? <UserMenu user={user} /> : <SignInButton />}
      </div>
    </header>
  )
}

function HeaderNav() {
  return (
    <nav className={hstack({ gap: 2, mr: "auto", flexWrap: "wrap" })}>
      <Link
        to={$path("/settings")}
        className={cx(button({ variant: "ghost" }), css({ mx: -3 }))}
      >
        <LucideWrench /> Settings
      </Link>
    </nav>
  )
}

function UserMenu({ user }: { user: { name: string; avatar: string | null } }) {
  return (
    <Menu>
      <MenuButton>
        <Avatar src={user.avatar} />
      </MenuButton>
      <MenuPanel side="bottom" align="end">
        <p
          className={flex({
            direction: "column",
            gap: 1.5,
            borderBottomWidth: 1,
            borderColor: "base.600",
            py: 2,
            px: 3,
            lineHeight: 1,
          })}
        >
          <span className={css({ fontSize: "sm", color: "base.400" })}>
            logged in as
          </span>
          <span>{user.name}</span>
        </p>
        <MenuItem asChild>
          <Link to={$path("/auth/logout")}>
            <LucideLogOut size={20} /> Sign out
          </Link>
        </MenuItem>
      </MenuPanel>
    </Menu>
  )
}

function SignInButton() {
  return (
    <Link to={$path("/auth/discord")} className={button()}>
      <LucideLogIn /> Sign in with Discord
    </Link>
  )
}
