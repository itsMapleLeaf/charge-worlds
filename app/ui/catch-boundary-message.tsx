import { Link, useCatch } from "@remix-run/react"
import { route } from "routes-gen"
import { SystemMessage } from "./system-message"

export function CatchBoundaryMessage() {
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
