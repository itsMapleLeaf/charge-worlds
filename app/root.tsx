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
  useTransition,
} from "@remix-run/react"
import clsx from "clsx"
import { LogIn, Zap } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import reactMosaicCss from "react-mosaic-component/react-mosaic-component.css"
import { route } from "routes-gen"
import favicon from "./assets/favicon.svg"
import { getSessionUser } from "./auth/session.server"
import { UserMenuButton } from "./auth/user-menu-button"
import { getAppMeta } from "./core/meta"
import styles from "./generated/styles.css"
import { pick } from "./helpers/pick"
import { CatchBoundaryMessage } from "./ui/catch-boundary-message"
import { LoadingSpinner } from "./ui/loading"
import { clearButtonClass, maxWidthContainerClass } from "./ui/styles"

export const meta = (): HtmlMetaDescriptor => getAppMeta()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/rubik/variable.css" },
  { rel: "stylesheet", href: reactMosaicCss },
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request, params }: LoaderArgs) {
  const user = await getSessionUser(request)
  return json({
    user: user && pick(user, ["name", "avatarUrl"]),
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  return (
    <Document bodyClassName="min-h-screen grid grid-rows-[auto,1fr]">
      <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 items-center">
        <Link to={route("/")} className="flex items-center gap-2 mr-2">
          <Zap />
          <h1 className="text-2xl font-light">Charge Worlds</h1>
        </Link>
        <div className="flex-1" />
        <nav className="flex items-center gap-4">
          {data.user ? (
            <UserMenuButton user={data.user} />
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
      <main className="bg-slate-900">
        <Outlet />
      </main>
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

function Document({
  children,
  bodyClassName,
}: {
  children: ReactNode
  bodyClassName?: string
}) {
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
      <body className={bodyClassName}>
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
