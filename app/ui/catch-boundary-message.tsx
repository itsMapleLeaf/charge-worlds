import { Link, useCatch } from "@remix-run/react"
import { EmptyState } from "~/ui/empty-state"
import { linkStyle } from "~/ui/styles"

export function CatchBoundaryMessage() {
  const caught = useCatch()
  return (
    <EmptyState title="oops">
      {caught.status === 404 ? (
        <p>Couldn't find what you were looking for.</p>
      ) : caught.status === 401 ? (
        <p>
          You need to{" "}
          <Link to="/auth/discord/login" className={linkStyle()}>
            log in
          </Link>{" "}
          to see this.
          <br />
          <Link to="/" className={linkStyle()}>
            Return to safety
          </Link>
        </p>
      ) : caught.status === 403 ? (
        <p>You're not allowed to see this.</p>
      ) : (
        <p>It's probably on our end. Try again?</p>
      )}
    </EmptyState>
  )
}
