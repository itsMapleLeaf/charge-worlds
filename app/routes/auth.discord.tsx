import { loginWithDiscord } from "~/data/session.server"

export async function loader() {
  return loginWithDiscord()
}
