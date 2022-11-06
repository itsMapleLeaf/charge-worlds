import type {
  ErrorBoundaryComponent,
  HtmlMetaDescriptor,
  LinksFunction,
} from "@remix-run/node"
import { Links, Meta, Outlet, Scripts, useTransition } from "@remix-run/react"
import clsx from "clsx"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import reactMosaicCss from "react-mosaic-component/react-mosaic-component.css"
import favicon from "./assets/favicon.svg"
import { getAppMeta } from "./core/meta"
import styles from "./generated/styles.css"
import { CatchBoundaryMessage } from "./ui/catch-boundary-message"
import { LoadingSpinner } from "./ui/loading"
import { maxWidthContainerClass } from "./ui/styles"

export const meta = (): HtmlMetaDescriptor => getAppMeta()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: "/rubik/variable.css" },
  { rel: "stylesheet", href: reactMosaicCss },
  { rel: "stylesheet", href: styles },
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
