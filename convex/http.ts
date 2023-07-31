import { httpRouter } from "convex/server"
import { discordAuthCallback, discordLogin, logout } from "./auth"

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

http.route({
	path: "/auth/logout",
	method: "GET",
	handler: logout,
})

export default http
