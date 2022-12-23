import { type MetaFunction } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react"
import { Heart } from "lucide-react"
import backgroundImage from "./assets/bg.png"
import { ExternalLink } from "./dom/external-link"
import { linkStyle } from "./styles"
import styles from "./styles/app.css"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Charge Worlds",
  viewport: "width=device-width,initial-scale=1",
})

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: "/fonts/rubik/variable.css" },
]

export default function App() {
  return (
    <html
      lang="en"
      className="bg-black text-gray-50 break-words"
      style={{ wordBreak: "break-word" }}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col gap-8 w-full min-h-screen p-4 md:p-8">
        <div
          className="fixed -z-10 inset-0 opacity-40 -scale-x-100 bg-left-top bg-cover"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        <div className="mb-auto">
          <Outlet />
        </div>

        <footer className="text-sm opacity-75 flex justify-between items-end">
          <p>
            Created with <Heart className="inline s-5 text-accent-300" /> by{" "}
            <ExternalLink
              href="https://github.com/itsMapleLeaf"
              className={linkStyle()}
            >
              itsMapleLeaf
            </ExternalLink>
            <br />
            Background by{" "}
            <ExternalLink
              href="https://twitter.com/alc3vol"
              className={linkStyle()}
            >
              @alc3vol
            </ExternalLink>
          </p>
          <p>
            <ExternalLink
              href="https://soundcloud.com/dylantallchief/san-holo-plant"
              className="text-lg opacity-50 transition-opacity hover:opacity-100"
              title="plant"
            >
              🪴
            </ExternalLink>
          </p>
        </footer>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
