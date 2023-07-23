import type { Session } from "@prisma/client"
import { createCookie, redirect } from "@remix-run/node"
import { $path } from "remix-routes"
import { z } from "zod"
import { db } from "./db.server"
import { env } from "./env.server"

const sessionCookieSchema = z.object({
  sessionId: z.string(),
})
type SessionCookie = z.infer<typeof sessionCookieSchema>

const sessionCookie = createCookie("charge_worlds_session", {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  secrets: [env.COOKIE_SECRET],
  maxAge: 60 * 60 * 24 * 365, // 1 year
})

type DiscordTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export function loginWithDiscord() {
  const url = new URL("https://discord.com/api/oauth2/authorize")
  url.searchParams.set("client_id", env.DISCORD_CLIENT_ID)
  url.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI)
  url.searchParams.set("scope", "identify")
  url.searchParams.set("response_type", "code")
  return redirect(url.href)
}

export async function handleDiscordCallback(request: Request) {
  const code = new URL(request.url).searchParams.get("code")
  if (!code) {
    throw new Response(undefined, {
      status: 500,
      statusText: "Discord login failed: no code",
    })
  }

  const authTokenResponse = await fetch(
    "https://discord.com/api/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        redirect_uri: env.DISCORD_REDIRECT_URI,
        code,
      }),
    },
  )

  if (!authTokenResponse.ok) {
    throw authTokenResponse
  }

  const data = (await authTokenResponse.json()) as DiscordTokenResponse

  const { id } = await db.session.create({
    data: {
      discordAccessToken: data.access_token,
      discordRefreshToken: data.refresh_token,
      discordExpiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
    select: { id: true },
  })

  const sessionCookieValue: SessionCookie = { sessionId: id }

  return redirect($path("/"), {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(sessionCookieValue),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  if (session) {
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

    await db.session.delete({ where: { id: session.id } }).catch((error) => {
      console.warn("Failed to delete session:", error)
    })
  }

  return redirect($path("/"), {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(null),
    },
  })
}

export async function getSession(request: Request): Promise<Session | null> {
  const sessionResult = sessionCookieSchema.safeParse(
    await sessionCookie.parse(request.headers.get("cookie")),
  )
  if (!sessionResult.success) return null

  return db.session.findUnique({
    where: { id: sessionResult.data.sessionId },
  })
}

export type DiscordUser = Awaited<ReturnType<typeof getDiscordUser>>
export async function getDiscordUser(session: Session) {
  const response = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${session.discordAccessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get discord user")
  }

  const schema = z.object({
    id: z.string(),
    username: z.string(),
    global_name: z.string().nullable(),
    avatar: z.string().nullable(),
  })

  const data = schema.parse(await response.json())

  return {
    id: data.id,
    username: data.username,
    globalName: data.global_name,
    avatarUrl: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`,
  }
}
