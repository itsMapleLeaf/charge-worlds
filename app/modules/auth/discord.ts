import { z } from "zod"
import { env } from "../app/env.server"

export function getAuthorizeUrl() {
  const url = new URL("https://discord.com/api/oauth2/authorize")
  url.searchParams.set("client_id", env.DISCORD_CLIENT_ID)
  url.searchParams.set("redirect_uri", env.DISCORD_REDIRECT_URI)
  url.searchParams.set("scope", "identify")
  url.searchParams.set("response_type", "code")
  return url.toString()
}

export type DiscordTokenResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function discordLogin(authCode: string) {
  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      redirect_uri: env.DISCORD_REDIRECT_URI,
      code: authCode,
    }),
  })

  if (!response.ok) {
    await throwResponseError(response, `Discord login failed`)
  }

  return (await response.json()) as DiscordTokenResponse
}

const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    username: z.string(),
    avatar: z.string().nullish(),
  }),
})

export type DiscordUser = z.infer<typeof authResponseSchema>["user"]

export async function getDiscordAuthUser(accessToken: string) {
  const response = await fetch("https://discord.com/api/oauth2/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    await throwResponseError(response, `Discord auth response failed`)
  }

  const data = authResponseSchema.parse(await response.json())
  return data.user
}

async function throwResponseError(response: Response, messagePrefix: string) {
  const data = await response.json().catch(() => undefined)
  const dataString = JSON.stringify(data, undefined, 2) ?? ""
  throw new Error(
    `${messagePrefix} (${response.status} ${response.statusText}) ${dataString}`,
  )
}
