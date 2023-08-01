import { v } from "convex/values"
import { api, internal } from "./_generated/api"
import { type Id } from "./_generated/dataModel"
import { httpAction, query } from "./_generated/server"
import { getDiscordUser } from "./discord"
import { env } from "./env"
import { getSessionUser, isAdminUser } from "./users"

export const discordLogin = httpAction(async (ctx, request) => {
	const requestParams = new URL(request.url).searchParams

	const state = new URLSearchParams()
	state.set("callbackUrl", requestParams.get("callbackUrl") as string)

	const url = new URL("https://discord.com/api/oauth2/authorize")
	url.searchParams.set("client_id", env.DISCORD_CLIENT_ID)
	url.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI)
	url.searchParams.set("scope", "identify")
	url.searchParams.set("response_type", "code")
	url.searchParams.set("state", state.toString())
	return Response.redirect(url.href)
})

export const discordAuthCallback = httpAction(async (ctx, request) => {
	const url = new URL(request.url)

	const code = url.searchParams.get("code")
	if (!code) {
		return new Response("No code provided", { status: 400 })
	}

	const state = new URLSearchParams(url.searchParams.get("state") ?? "")

	const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: env.DISCORD_CLIENT_ID,
			client_secret: env.DISCORD_CLIENT_SECRET,
			grant_type: "authorization_code",
			code,
			redirect_uri: env.DISCORD_REDIRECT_URI,
			scope: "identify",
		}),
	})
	if (!tokenResponse.ok) {
		return tokenResponse
	}

	const tokenData = (await tokenResponse.json()) as {
		access_token: string
	}

	const { user: discordUser, response: userResponse } = await getDiscordUser(
		tokenData.access_token,
	)
	if (!discordUser) {
		return userResponse
	}

	const existingUser = await ctx.runQuery(internal.users.getByDiscordId, {
		discordId: discordUser.id,
	})
	let userId

	if (existingUser) {
		await ctx.runMutation(internal.users.update, {
			id: existingUser._id,
			name: discordUser.displayName,
			avatar: discordUser.avatarUrl,
		})
		userId = existingUser._id
	} else {
		userId = await ctx.runMutation(internal.users.create, {
			name: discordUser.displayName,
			avatar: discordUser.avatarUrl,
			discordId: discordUser.id,
			discordAccessToken: tokenData.access_token,
		})
	}

	const sessionId = await ctx.runMutation(internal.sessions.create, {
		userId,
	})

	return Response.redirect(
		(state.get("callbackUrl") ?? "/") + `?sessionId=${sessionId}`,
	)
})

export const logout = httpAction(async (ctx, request) => {
	const sessionId = new URL(request.url).searchParams.get(
		"sessionId",
	) as Id<"sessions"> | null
	if (!sessionId) {
		return new Response("No session id provided", { status: 400 })
	}

	const session = await ctx.runQuery(api.sessions.get, { id: sessionId })
	if (!session) {
		return new Response("Session not found", { status: 404 })
	}

	const user = await ctx.runQuery(internal.users.get, { id: session.userId })
	if (!user) {
		return new Response("User not found", { status: 404 })
	}

	await fetch("https://discord.com/api/oauth2/token/revoke", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			client_id: env.DISCORD_CLIENT_ID,
			client_secret: env.DISCORD_CLIENT_SECRET,
			token: user.discordAccessToken,
		}),
	}).catch((error) => {
		console.warn("Failed to revoke discord token:", error)
	})

	await ctx
		.runMutation(internal.sessions.remove, { id: sessionId })
		.catch((error) => {
			console.warn("Failed to delete session:", error)
		})

	return new Response("Logged out", { status: 200 })
})

export const me = query({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
	},
	handler: async (ctx, args) => {
		const user = await getSessionUser(ctx, args.sessionId)
		return { user, isAdmin: isAdminUser(user) }
	},
})
