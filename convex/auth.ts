import { v } from "convex/values"
import { getDiscordUser } from "../app/discord"
import { api, internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import { action, httpAction } from "./_generated/server"
import { env } from "./env"

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

  const response = await fetch("https://discord.com/api/oauth2/token", {
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
  if (!response.ok) {
    return response
  }

  const data = (await response.json()) as { access_token: string }

  const { sessionId } = await ctx.runMutation(internal.sessions.create, {
    discordAccessToken: data.access_token,
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
    return new Response("Invalid session id", { status: 400 })
  }

  await fetch("https://discord.com/api/oauth2/token/revoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      token: session.discordAccessToken,
    }),
  }).catch((error) => {
    console.warn("Failed to revoke discord token:", error)
  })

  await ctx
    .runMutation(internal.sessions.remove, { sessionId })
    .catch((error) => {
      console.warn("Failed to delete session:", error)
    })

  return new Response("Logged out", { status: 200 })
})

export const requireAdmin = action({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(api.sessions.get, { id: args.sessionId })
    if (!session) throw new Error("Not logged in")

    const { user } = await getDiscordUser(session.discordAccessToken)
    if (!user) throw new Error("Not logged in")
    if (user.id !== env.ADMIN_DISCORD_USER_ID) throw new Error("Unauthorized")
  },
})
