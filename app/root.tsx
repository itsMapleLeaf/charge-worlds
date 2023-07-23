import type {
  LinksFunction,
  LoaderArgs,
  V2_MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react"
import type { ReactNode } from "react"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"
import favicon from "./assets/favicon.svg"
import { getAppMeta } from "./data/meta"
import { getSessionUser } from "./data/session.server"
import { pick } from "./helpers/pick"
import styles from "./root.css"

export const meta: V2_MetaFunction = () => getAppMeta()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  return json({
    user: user && pick(user, ["id", "name", "avatarUrl"]),
  })
}

export default function Root() {
  return (
    <Document>
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

function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={css({ bg: "neutral.900", color: "blue.50" })}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header
          className={cx(
            css({ bg: "neutral.800", shadow: "lg", px: "4", h: "12" }),
            hstack(),
          )}
        >
          <h1 className={css({ fontSize: "lg", fontWeight: "light" })}>
            Charge Worlds
          </h1>
        </header>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
