import { httpRouter } from "convex/server"
import { discordAuthCallback, discordLogin } from "./auth"

const http = httpRouter()

http.route({
  path: "/auth/discord",
  method: "GET",
  handler: discordLogin,
})

http.route({
  path: "/auth/discord/callback",
  method: "GET",
  handler: discordAuthCallback,
})

export default http
