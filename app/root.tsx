import splineSans from "@fontsource-variable/spline-sans/index.css"
import { cssBundleHref } from "@remix-run/css-bundle"
import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { LucideLogIn, LucideLogOut } from "lucide-react"
import type { ReactNode } from "react"
import { $path } from "remix-routes"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"
import favicon from "./assets/favicon.svg"
import { button } from "./components/button"
import { container } from "./components/container"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./components/menu"
import { getAppMeta } from "./data/meta"
import type { DiscordUser } from "./data/session.server"
import { getDiscordUser, getSession } from "./data/session.server"
import styles from "./root.css"

export const meta: V2_MetaFunction = () => getAppMeta()

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: splineSans },
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request)
  const user = session && (await getDiscordUser(session))
  return json({ user })
}

export default function Root() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <Document user={user}>
      <Outlet />
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <Document>
        <h1>Oops! Something went wrong.</h1>
        <p>{error.statusText}</p>
        <a href="/">Return to safety</a>
      </Document>
    )
  }

  const message =
    error instanceof Error ? error.stack || error.message : String(error)

  return (
    <Document>
      <h1>Oops! Something went wrong.</h1>
      <pre>{message}</pre>
      <a href="/">Return to safety</a>
    </Document>
  )
}

function Document({
  children,
  user,
}: {
  children: ReactNode
  user?: DiscordUser | null
}) {
  return (
    <html
      lang="en"
      className={css({
        bg: "neutral.900",
        color: "blue.50",
        fontFamily: "sans",
      })}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className={hstack({ bg: "neutral.800", h: "16", shadow: "lg" })}>
          <header
            className={cx(container(), hstack({ justify: "space-between" }))}
          >
            <h1 className={css({ fontSize: "2xl", fontWeight: "light" })}>
              World of Arte
            </h1>
            {user ? (
              <Menu>
                <MenuButton>
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className={css({ w: "8", h: "8", rounded: "full" })}
                  />
                </MenuButton>
                <MenuPanel>
                  <MenuItem asChild>
                    <Link to={$path("/auth/logout")}>
                      <LucideLogOut size={20} /> Sign out
                    </Link>
                  </MenuItem>
                </MenuPanel>
              </Menu>
            ) : (
              <Link
                to={$path("/auth/discord")}
                draggable={false}
                className={button()}
              >
                <LucideLogIn /> Sign in with Discord
              </Link>
            )}
          </header>
        </div>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
