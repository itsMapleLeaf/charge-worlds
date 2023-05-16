import rubik from "@fontsource/rubik/variable.css"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import type { LinksFunction, LoaderArgs, V2_MetaFunction } from "@vercel/remix"
import { json } from "@vercel/remix"
import type { ReactNode } from "react"
import background from "./assets/bg-witch.png"
import favicon from "./assets/favicon.svg"
import { AuthProvider } from "./components/auth-context"
import { CatchBoundaryMessage } from "./components/catch-boundary-message"
import { ExternalLink } from "./components/external-link"
import { ToastProvider } from "./components/toast"
import { getAppMeta } from "./data/meta"
import { getSessionUser } from "./data/session.server"
import { getSettings, type Settings } from "./data/settings.server"
import { pick } from "./helpers/pick"
import styles from "./root.css"

export const meta: V2_MetaFunction = () => getAppMeta()

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: rubik },
  { rel: "stylesheet", href: styles },
  { rel: "icon", href: favicon },
]

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  const settings = await getSettings(request)
  return json({
    user: user && pick(user, ["id", "name", "avatarUrl"]),
    settings,
  })
}

export default function Root() {
  const data = useLoaderData<typeof loader>()
  return (
    <Document settings={data.settings}>
      <AuthProvider user={data.user}>
        <Outlet />
      </AuthProvider>
    </Document>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  const settings: Settings = {
    fancyMode: false,
  }

  if (isRouteErrorResponse(error)) {
    return (
      <Document settings={settings}>
        <div className="container py-8">
          <CatchBoundaryMessage response={error} />
        </div>
      </Document>
    )
  }

  const message =
    error instanceof Error ? error.stack || error.message : String(error)

  return (
    <Document settings={settings}>
      <div className="container">
        <div className="grid gap-4 py-4">
          <h1 className="text-4xl font-light">Oops! Something went wrong.</h1>
          <pre className="glass panel overflow-x-auto p-4">{message}</pre>
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
  settings,
}: {
  children: ReactNode
  settings: Settings
}) {
  return (
    <html
      lang="en"
      data-fancy-mode={settings.fancyMode || undefined}
      className="break-words bg-black text-accent-50 [word-break:break-word]"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body
        className="bg-[length:100%_auto] bg-top bg-no-repeat fancy:bg-fixed"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="flex min-h-[100vh] flex-col bg-black/50">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col p-4 lg:px-8">
            <ToastProvider>{children}</ToastProvider>
          </div>

          <footer className="p-2 text-center text-xs opacity-60">
            art by{" "}
            <ExternalLink
              href="https://www.pixiv.net/en/artworks/101034134"
              className="anchor-underline"
            >
              ALC.3%VOL
            </ExternalLink>{" "}
            &bull;{" "}
            <ExternalLink
              href="https://github.com/itsMapleLeaf/charge-worlds"
              className="anchor-underline"
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
