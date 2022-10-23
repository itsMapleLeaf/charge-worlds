import type {
  ErrorBoundaryComponent,
  HtmlMetaDescriptor,
  LinksFunction,
} from "@remix-run/node"
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
  useTransition,
} from "@remix-run/react"
import clsx from "clsx"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import { route } from "routes-gen"
import favicon from "./assets/favicon.svg"
import tailwind from "./generated/tailwind.css"
import { LoadingSpinner } from "./ui/loading"
import { maxWidthContainerClass } from "./ui/styles"

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
  { rel: "stylesheet", href: tailwind },
  { rel: "icon", href: favicon },
]

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function CatchBoundary() {
  return (
    <Document>
      <div className={maxWidthContainerClass}>
        <div className="py-8">
          <CatchBoundaryContent />
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
          <h1 className="font-header text-4xl font-light">
            Oops! Something went wrong.
          </h1>
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

function CatchBoundaryContent() {
  const response = useCatch()

  if (response.status === 401) {
    return (
      <SystemMessage>
        <p>
          To see this, please{" "}
          <a href={route("/auth/discord/login")} className="underline">
            Login with Discord
          </a>
        </p>
      </SystemMessage>
    )
  }

  if (response.status === 403) {
    return (
      <SystemMessage>
        <p>
          {`Sorry, you're not allowed to see this. `}
          <Link to={route("/auth/logout")} className="underline">
            Log out
          </Link>
        </p>
      </SystemMessage>
    )
  }

  return (
    <SystemMessage>
      <p>Oops! Something went wrong.</p>
    </SystemMessage>
  )
}

function Document({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="font-body overflow-y-auto break-words bg-gray-800 text-gray-100"
      style={{ wordBreak: "break-word", scrollbarGutter: "stable" }}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
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

function SystemMessage({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-4">
      {children}
      <p className="opacity-75">{`(i'll make this less jank later)`}</p>
    </section>
  )
}
