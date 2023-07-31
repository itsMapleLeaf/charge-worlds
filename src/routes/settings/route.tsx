import { Link, Outlet } from "@remix-run/react"
import { LucideGlobe, LucideList, LucideUsers } from "lucide-react"
import { $path } from "remix-routes"
import { cx } from "styled-system/css"
import { flex } from "styled-system/patterns"
import { button } from "~/styles/button"
import { container } from "~/styles/container"

export default function SettingsPage() {
  return (
    <div className={cx(container(), flex({ py: 4 }))}>
      <nav
        className={flex({
          direction: "column",
          alignItems: "start",
          w: 48,
          gap: 3,
          py: 2,
        })}
      >
        <Link to={$path("/settings")} className={button({ variant: "ghost" })}>
          <LucideGlobe /> General
        </Link>
        <Link
          to={$path("/settings/players")}
          className={button({ variant: "ghost" })}
        >
          <LucideUsers /> Players
        </Link>
        <Link
          to={$path("/settings/character-fields")}
          className={button({ variant: "ghost" })}
        >
          <LucideList /> Character Fields
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
