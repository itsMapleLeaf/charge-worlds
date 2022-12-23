import { Link } from "@remix-run/react"
import { Zap } from "lucide-react"
import { type ReactNode } from "react"
import { linkStyle } from "./styles"

type Breadcrumb = { title: string; href: string }

export function PageHeader(props: {
  title: ReactNode
  breadcrumbs?: Breadcrumb[]
}) {
  return (
    <header>
      <nav className="flex items-center opacity-75">
        <div className="flex flex-wrap items-center gap-x-2 font-light text-lg flex-1">
          <Link to="/" className={linkStyle({ underline: false })}>
            <AppLogo />
          </Link>
          {props.breadcrumbs?.map((breadcrumb, index) => (
            <BreadcrumbLink key={index} breadcrumb={breadcrumb} />
          ))}
        </div>
        <UserButton />
      </nav>
      {typeof props.title === "string" ? (
        <h1 className="text-4xl font-light">{props.title}</h1>
      ) : (
        <div className="text-4xl font-light">{props.title}</div>
      )}
    </header>
  )
}

function AppLogo() {
  return (
    <div className="flex items-center gap-1">
      <Zap class="inline s-5" />
      <div className="font-light text-lg">Charge Worlds</div>
    </div>
  )
}

function BreadcrumbLink(props: { breadcrumb: Breadcrumb }) {
  return (
    <div className="before:content-['/'] before:opacity-75 before:mr-2">
      <Link
        to={props.breadcrumb.href}
        className={linkStyle({ underline: false })}
      >
        {props.breadcrumb.title}
      </Link>
    </div>
  )
}

function UserButton() {
  return (
    <button
      className="opacity-70 hover:opacity-100 transition-opacity"
      title="Account actions"
    >
      <img
        src="https://cdn.discordapp.com/avatars/781416346793279529/9dfb8017d2fcf4ef584d57179f42dec9.webp?size=128"
        className="s-8 rounded-full"
        alt=""
      />
    </button>
  )
}
