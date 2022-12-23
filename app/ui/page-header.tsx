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
        <div className="flex flex-1 flex-wrap items-center gap-x-2 text-lg font-light">
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
      <Zap className="inline s-5" />
      <div className="text-lg font-light">Charge Worlds</div>
    </div>
  )
}

function BreadcrumbLink(props: { breadcrumb: Breadcrumb }) {
  return (
    <div className="before:mr-2 before:opacity-75 before:content-['/']">
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
      className="opacity-70 transition-opacity hover:opacity-100"
      title="Account actions"
    >
      <img
        src="https://cdn.discordapp.com/avatars/781416346793279529/9dfb8017d2fcf4ef584d57179f42dec9.webp?size=128"
        className="rounded-full s-8"
        alt=""
      />
    </button>
  )
}
