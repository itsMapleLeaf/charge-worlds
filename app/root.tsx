import rubik from "@fontsource/rubik/variable.css"
import type {
  ErrorBoundaryComponent,
  HtmlMetaDescriptor,
  LinksFunction,
  LoaderArgs,
} from "@remix-run/node"
import { json } from "@remix-run/node"
import type { ShouldRevalidateFunction } from "@remix-run/react"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useLoaderData,
} from "@remix-run/react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"
import reactMosaicCss from "react-mosaic-component/react-mosaic-component.css"
import background from "./assets/bg-witch.png"
import favicon from "./assets/favicon.svg"
import { pick } from "./helpers/pick"
import { AuthProvider } from "./modules/app/auth"
import { getAppMeta } from "./modules/app/meta"
import { getSessionUser } from "./modules/auth/session.server"
import { ExternalLink } from "./modules/dom/external-link"
import { CatchBoundaryMessage } from "./modules/ui/catch-boundary-message"
import { linkClass } from "./modules/ui/link"
import { maxWidthContainerClass } from "./modules/ui/styles"
import tailwind from "./modules/ui/tailwind.css"
import { ToastProvider } from "./modules/ui/toast"

export const meta = (): HtmlMetaDescriptor => getAppMeta()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: rubik },
  { rel: "stylesheet", href: reactMosaicCss },
  { rel: "stylesheet", href: tailwind },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  return json({
    user: user && pick(user, ["name", "avatarUrl"]),
  })
}

export const shouldRevalidate: ShouldRevalidateFunction = () => false

export default function App() {
  const data = useLoaderData<typeof loader>()
  return (
    <Document>
      <AuthProvider user={data.user}>
        <Outlet />
      </AuthProvider>
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
      className="break-words bg-neutral-1 bg-cover bg-fixed bg-right bg-no-repeat font-body text-foreground-1 [word-break:break-word]"
      style={{ backgroundImage: `url(${background})` }}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex min-h-screen flex-col bg-black/50">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 md:px-8">
            <ToastProvider>{children}</ToastProvider>
          </div>
          <footer className="p-2 text-center text-xs opacity-60">
            art by{" "}
            <ExternalLink
              href="https://www.pixiv.net/en/artworks/101034134"
              className={linkClass}
            >
              ALC.3%VOL
            </ExternalLink>{" "}
            &bull;{" "}
            <ExternalLink
              href="https://github.com/itsMapleLeaf/charge-worlds"
              className={linkClass}
            >
              view source
            </ExternalLink>
          </footer>
        </div>
        <Scripts />
        {process.env.NODE_ENV !== "production" && <LiveReload />}
      </body>
    </html>
  )
}
