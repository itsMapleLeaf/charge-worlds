import { redirect } from "@remix-run/node"
import { createLogoutCookie } from "../auth/session.server"

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
