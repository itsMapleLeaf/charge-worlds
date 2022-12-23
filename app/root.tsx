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
import tailwind from "../generated/tailwind.css"
import backgroundImage from "./assets/bg.png"
import favicon from "./assets/favicon.svg"
import { linkStyle } from "./styles"
import { ExternalLink } from "./ui/external-link"

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Charge Worlds",
  viewport: "width=device-width,initial-scale=1",
})

export const links = () => [
  { rel: "stylesheet", href: tailwind },
  { rel: "stylesheet", href: "/fonts/rubik/variable.css" },
  { rel: "icon", href: favicon },
]

export default function App() {
  return (
    <html
      lang="en"
      className="break-words bg-black text-gray-50"
      style={{ wordBreak: "break-word" }}
    >
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div
          className="fixed inset-0 -z-10 -scale-x-100 bg-cover bg-left-top opacity-40"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        <div className="flex min-h-screen flex-col gap-8 p-4 md:p-8">
          <div className="mb-auto">
            <Outlet />
          </div>

          <footer className="flex items-end justify-between text-sm opacity-75">
            <p>
              Created with <Heart className="inline text-accent-300 s-5" /> by{" "}
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
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
