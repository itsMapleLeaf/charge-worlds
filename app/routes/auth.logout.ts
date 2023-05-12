import { redirect } from "@vercel/remix"
import { createLogoutCookie } from "~/data/session.server"

export async function loader() {
  return redirect("/", {
    headers: { "Set-Cookie": await createLogoutCookie() },
  })
}

export async function action() {
  return redirect("/", {
    headers: { "Set-Cookie": await createLogoutCookie() },
  })
}
