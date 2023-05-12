import { Link } from "@remix-run/react"
import { type ErrorResponse } from "@remix-run/router"
import { route } from "routes-gen"
import { SystemMessage } from "./system-message"

export function CatchBoundaryMessage({
  response,
}: {
  response: ErrorResponse
}) {
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

  if (response.status === 404) {
    return (
      <SystemMessage>
        <p>{`Couldn't find what you were looking for.`}</p>
        <Link to={route("/")} className="underline">
          Go home
        </Link>
      </SystemMessage>
    )
  }

  return (
    <SystemMessage>
      <p>Oops! Something went wrong.</p>
      <Link to={route("/")} className="underline">
        Go home
      </Link>
    </SystemMessage>
  )
}
