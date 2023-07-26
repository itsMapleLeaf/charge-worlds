import { v } from "convex/values"
import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import {
  action,
  httpAction,
  internalMutation,
  internalQuery,
} from "./_generated/server"
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

  const { sessionId } = await ctx.runMutation(internal.auth.createSession, {
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

  const session = await ctx.runQuery(internal.auth.getSession, { sessionId })
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
    .runMutation(internal.auth.destroySession, { sessionId })
    .catch((error) => {
      console.warn("Failed to delete session:", error)
    })

  return new Response("Logged out", { status: 200 })
})

export const getUser = action({
  args: { sessionId: v.id("sessions") },
  async handler(ctx, args) {
    const session = await ctx.runQuery(internal.auth.getSession, args)
    if (!session) return null

    const response = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${session.discordAccessToken}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as {
      id: string
      global_name: string
      avatar: string | null
    }

    return {
      id: data.id,
      displayName: data.global_name,
      avatarUrl: data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
        : null,
    }
  },
})

export const getSession = internalQuery({
  args: { sessionId: v.id("sessions") },
  async handler(ctx, args) {
    return await ctx.db.get(args.sessionId)
  },
})

export const createSession = internalMutation({
  args: { discordAccessToken: v.string() },
  async handler(ctx, args) {
    const sessionId = await ctx.db.insert("sessions", args)
    return { sessionId }
  },
})

export const destroySession = internalMutation({
  args: { sessionId: v.id("sessions") },
  async handler(ctx, args) {
    await ctx.db.delete(args.sessionId)
  },
})
