import type {
  ErrorBoundaryComponent,
  HtmlMetaDescriptor,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
  useMatches,
  useTransition,
} from "@remix-run/react"
import clsx from "clsx"
import { LayoutDashboard, LogIn, Wrench, Zap } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import reactMosaicCss from "react-mosaic-component/react-mosaic-component.css"
import { route } from "routes-gen"
import favicon from "./assets/favicon.svg"
import { getMembership } from "./auth/membership"
import { getSessionUser } from "./auth/session"
import { UserContext } from "./auth/user-context"
import { UserMenuButton } from "./auth/user-menu-button"
import {
  DashboardNewWindowButton,
  DashboardProvider,
} from "./dashboard/dashboard"
import styles from "./generated/styles.css"
import { CatchBoundaryMessage } from "./ui/catch-boundary-message"
import { LoadingSpinner } from "./ui/loading"
import { clearButtonClass, maxWidthContainerClass } from "./ui/styles"
import { getDefaultWorld } from "./world/world-db.server"

export const meta = (): HtmlMetaDescriptor => {
  const title = "Charge Worlds"
  const description = "Virtual environment for the Charge RPG system"
  const siteUrl = "https://charge-worlds.mapleleaf.dev"

  return {
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    "charset": "utf-8",
    "viewport": "width=device-width,initial-scale=1",

    title,
    description,
    "theme-color": "#1e293b",

    "og:type": "website",
    "og:url": siteUrl,
    "og:title": title,
    "og:description": description,

    "twitter:card": "summary_large_image",
    "twitter:url": siteUrl,
    "twitter:title": title,
    "twitter:description": description,
  }
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/rubik/variable.css" },
  { rel: "stylesheet", href: reactMosaicCss },
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const [world, user] = await Promise.all([
    getDefaultWorld(),
    getSessionUser(request),
  ])

  const membership = user && (await getMembership(user, world))

  return json({
    user: user && {
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    membership: membership && {
      role: membership?.role,
    },
  })
}

export default function App() {
  const { user, membership } = useLoaderData<typeof loader>()
  const matches = useMatches()

  return (
    <Document>
      <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
        <DashboardProvider>
          <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center">
            <div className="flex items-center gap-2 mr-2">
              <Zap />
              <h1 className="text-3xl font-light">Charge Worlds</h1>
            </div>

            {membership?.role === "OWNER" && (
              <nav className="flex items-center gap-4">
                <Link to={route("/dashboard")} className={clearButtonClass}>
                  <LayoutDashboard /> Dashboard
                </Link>
                <Link to={route("/settings")} className={clearButtonClass}>
                  <Wrench /> Settings
                </Link>
              </nav>
            )}

            <div className="flex-1" />

            <nav className="flex items-center gap-4">
              {matches.some((m) => m.pathname === route("/dashboard")) && (
                <DashboardNewWindowButton />
              )}

              {user ? (
                <UserMenuButton user={user} />
              ) : (
                <Link
                  to={route("/auth/discord/login")}
                  className={clearButtonClass}
                >
                  <LogIn /> Discord sign in
                </Link>
              )}
            </nav>
          </header>
          <main className="bg-slate-900 relative">
            <UserContext.Provider value={user}>
              <Outlet />
            </UserContext.Provider>
          </main>
        </DashboardProvider>
      </div>
    </Document>
  )
}

export function CatchBoundary() {
  return (
    <Document>
      <div className={maxWidthContainerClass}>
        <div className="py-8">
          <CatchBoundaryMessage />
        </div>
      </div>
    </Document>
  )
}

export function ErrorBoundary({
  error,
}: ComponentPropsWithoutRef<ErrorBoundaryComponent>) {
  const message =
    error instanceof Error ? error.stack || error.message : String(error)

  return (
    <Document>
      <div className={maxWidthContainerClass}>
        <div className="grid gap-4 py-4">
          <h1 className="text-4xl font-light">Oops! Something went wrong.</h1>
          <pre className="overflow-x-auto rounded-md bg-black/50 p-4">
            {message}
          </pre>
          <a href="/" className="underline hover:no-underline">
            Return to safety
          </a>
        </div>
      </div>
    </Document>
  )
}

function Document({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="font-body overflow-y-auto break-words bg-gray-800 text-gray-100"
      style={{ wordBreak: "break-word" }}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV !== "production" && (
          <script src="/live-reload.js" />
        )}
        <PendingIndicator />
      </body>
    </html>
  )
}

function PendingIndicator() {
  const transition = useTransition()
  const pending = transition.state !== "idle"
  return (
    <div
      className={clsx(
        "pointer-events-none fixed left-0 bottom-0 p-4 transition",
        pending ? "opacity-100" : "opacity-0",
      )}
    >
      <LoadingSpinner />
    </div>
  )
}
