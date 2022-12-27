import { Form, Link, useCatch } from "@remix-run/react"
import { EmptyState } from "~/ui/empty-state"
import { linkStyle } from "~/ui/styles"

export function CatchBoundaryMessage() {
  const caught = useCatch()

  const homeLink = (
    <>
      <br />
      <Link to="/" className={linkStyle()}>
        Return to home
      </Link>
    </>
  )

  return (
    <EmptyState title="oops">
      {caught.status === 404 ? (
        <p>
          Couldn't find what you were looking for.
          {homeLink}
        </p>
      ) : caught.status === 401 ? (
        <p>
          You need to{" "}
          <Form method="post" action="/auth/discord/login" className="contents">
            <button className={linkStyle()}>sign in with discord</button>
          </Form>{" "}
          to see this.
          {homeLink}
        </p>
      ) : caught.status === 403 ? (
        <p>
          You're not allowed to see this.
          {homeLink}
        </p>
      ) : (
        <p>
          Something went wrong. It's probably on my end. Try again?
          {homeLink}
        </p>
      )}
    </EmptyState>
  )
}
