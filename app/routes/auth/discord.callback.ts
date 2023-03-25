import type { LoaderArgs } from "@vercel/remix"
import { redirect } from "@vercel/remix"
import { createSessionCookie } from "../../modules/auth/session.server"

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const cookie = await createSessionCookie(url.searchParams.get("code")!)

  if (!cookie) {
    // TODO: render some error page
    return redirect("/")
  }

  return redirect("/", {
    headers: { "Set-Cookie": cookie },
  })
}
