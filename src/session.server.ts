import { createCookie, redirect } from "@remix-run/node"
import type { Id } from "convex/_generated/dataModel"
import { env } from "./env.server"

const sessionCookie = createCookie("charge-worlds-session", {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
})

export async function createSession(sessionId: string) {
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(sessionId),
    },
  })
}

export async function getSession(
  cookieHeader: string | null,
): Promise<Id<"sessions"> | null> {
  const cookieValue = (await sessionCookie.parse(cookieHeader)) as unknown
  return typeof cookieValue === "string"
    ? (cookieValue as Id<"sessions">)
    : null
}

export async function destroySession() {
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(null),
    },
  })
}
