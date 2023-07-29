import splineSans from "@fontsource-variable/spline-sans/index.css"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { cssBundleHref } from "@remix-run/css-bundle"
import {
  defer,
  type LinksFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node"
import {
  Await,
  isRouteErrorResponse,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import { api } from "convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import { LucideLogIn, LucideLogOut } from "lucide-react"
import { Suspense, useState, type ReactNode } from "react"
import { $path } from "remix-routes"
import { css, cx } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"
import favicon from "./assets/favicon.svg"
import { Avatar } from "./components/Avatar"
import { button } from "./components/button"
import { container } from "./components/container"
import { Menu, MenuButton, MenuItem, MenuPanel } from "./components/Menu"
import { env } from "./env.server"
import { getAppMeta } from "./meta"
import styles from "./root.css"
import { getSession } from "./session.server"

export const meta: V2_MetaFunction = () => getAppMeta()

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: splineSans },
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const sessionId = await getSession(request.headers.get("Cookie"))
  const convexClient = new ConvexHttpClient(env.CONVEX_URL)

  return defer({
    user: Promise.resolve(
      sessionId && (await convexClient.action(api.auth.getUser, { sessionId })),
    ),
    sessionId,
    convexUrl: env.CONVEX_URL,
  })
}

export default function Root() {
  const { convexUrl } = useLoaderData<typeof loader>()
  const [client] = useState(() => new ConvexReactClient(convexUrl))
  return (
    <ConvexProvider client={client}>
      <Document>
        <Header>
          <Suspense>
            <UserMenu />
          </Suspense>
        </Header>
        <Outlet />
      </Document>
    </ConvexProvider>
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
    <html
      lang="en"
      className={css({
        bg: "base.900",
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
        <div className={flex({ direction: "column", h: "screen" })}>
          <TooltipProvider>{children}</TooltipProvider>
        </div>
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

function Header({ children }: { children: ReactNode }) {
  return (
    <header
      className={hstack({
        bg: "base.800",
        h: "16",
        shadow: "lg",
        borderBottomWidth: 1,
        borderColor: "base.700",
      })}
    >
      <div className={cx(container(), hstack({ justify: "space-between" }))}>
        <h1 className={css({ fontSize: "2xl", fontWeight: "light" })}>
          World of Arte
        </h1>
        {children}
      </div>
    </header>
  )
}

function UserMenu() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <Await resolve={user}>
      {(user) => {
        if (!user) {
          return (
            <Link
              to={$path("/auth/discord")}
              draggable={false}
              className={button()}
            >
              <LucideLogIn /> Sign in with Discord
            </Link>
          )
        }

        return (
          <Menu>
            <MenuButton>
              <Avatar src={user.avatarUrl} />
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
                <span>{user.displayName}</span>
              </p>
              <MenuItem asChild>
                <Link to={$path("/auth/logout")}>
                  <LucideLogOut size={20} /> Sign out
                </Link>
              </MenuItem>
            </MenuPanel>
          </Menu>
        )
      }}
    </Await>
  )
}
