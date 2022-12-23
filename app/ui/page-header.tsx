import { Form, Link } from "@remix-run/react"
import { LogIn, Zap } from "lucide-react"
import { type ReactNode } from "react"
import { buttonStyle, linkStyle } from "./styles"
import { UserButton } from "./user-button"

type Breadcrumb = { title: string; href: string }

export function PageHeader(props: {
  title: ReactNode
  user: { name: string; avatarUrl?: string } | undefined
  breadcrumbs?: Breadcrumb[]
}) {
  return (
    <header>
      <div className="float-right">
        {props.user ? (
          <UserButton user={props.user} />
        ) : (
          <Form method="post" action="/auth/discord/login">
            <div className="sm:hidden">
              <button
                title="Sign in with Discord"
                className={buttonStyle({ shape: "circle" })}
              >
                <LogIn />
              </button>
            </div>
            <div className="hidden sm:block">
              <button className={buttonStyle()}>
                <LogIn /> Sign in with Discord
              </button>
            </div>
          </Form>
        )}
      </div>
      <nav className="flex items-center">
        <div className="flex flex-1 flex-wrap items-center gap-x-2 text-lg font-light opacity-75">
          <Link to="/" className={linkStyle({ underline: false })}>
            <AppLogo />
          </Link>
          {props.breadcrumbs?.map((breadcrumb, index) => (
            <BreadcrumbLink key={index} breadcrumb={breadcrumb} />
          ))}
        </div>
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
      <div className="flex-1 text-lg font-light">Charge Worlds</div>
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
