import { createCookieSessionStorage } from "@remix-run/node"
import { ConvexHttpClient } from "convex/browser"
import { randomUUID } from "crypto"
import { Authenticator, type AuthenticateOptions } from "remix-auth"
import { DiscordStrategy } from "remix-auth-discord"
import { type API } from "../convex/_generated/api"
import clientConfig from "../convex/_generated/clientConfig"
import { env } from "./env.server"

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [env.COOKIE_SECRET],
    secure: env.NODE_ENV === "production",
  },
})

const convex = new ConvexHttpClient<API>(clientConfig)

type Session = {
  sessionId: string
}

const authenticator = new Authenticator<Session>(sessionStorage)

const discordStrategy = "discord"
authenticator.use(
  new DiscordStrategy(
    {
      clientID: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      callbackURL: env.DISCORD_REDIRECT_URI,
    },
    async ({ profile }) => {
      const sessionId = randomUUID()

      const avatarId = profile.photos?.[0].value

      await convex.mutation("users:upsertUser")(env.CONVEX_ADMIN_SECRET, {
        discordId: profile.id,
        name: profile.displayName,
        avatarUrl: avatarId
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${avatarId}.png`
          : null,
        sessionId,
      })

      return { sessionId }
    },
  ),
  discordStrategy,
)

export function authenticateWithDiscord(
  request: Request,
  options?: Partial<AuthenticateOptions>,
) {
  return authenticator.authenticate(discordStrategy, request, options)
}

export async function getSession(request: Request) {
  return authenticator.isAuthenticated(request)
}

export function logout(request: Request) {
  return authenticator.logout(request, { redirectTo: "/" })
}

export async function findSessionUser(request: Request) {
  const session = await getSession(request)
  return (
    session &&
    (await convex.query("users:findUserBySessionId")(env.CONVEX_ADMIN_SECRET, {
      sessionId: session.sessionId,
    }))
  )
}
