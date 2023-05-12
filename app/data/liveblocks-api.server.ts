import { join } from "node:path"
import { env } from "~/data/env.server"

const baseHeaders: Record<string, string> = {
  Authorization: `Bearer ${env.LIVEBLOCKS_SECRET_KEY}`,
}

export const RoomAccesses = {
  private: [],
  read: ["room:read", "room:presence:write"],
  write: ["room:write"],
} as const
export type RoomAccess = keyof typeof RoomAccesses

const getApiUrl = (endpoint: string) =>
  new URL(join("/v2", endpoint), "https://api.liveblocks.io")

export async function throwResponseError(response: Response) {
  console.error(
    "Liveblocks request failed:",
    response.status,
    response.statusText,
    await response.json().catch(() => undefined),
  )
  throw new Response(undefined, { status: 500 })
}

export async function liveblocksGet(endpoint: string) {
  return fetch(getApiUrl(endpoint), {
    method: "GET",
    headers: baseHeaders,
  })
}

export async function liveblocksFetch(
  method: "GET" | "POST" | "DELETE",
  endpoint: string,
  body?: unknown,
) {
  const url = getApiUrl(endpoint)

  const options: RequestInit = body
    ? {
        method,
        headers: {
          ...baseHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    : {
        method,
        headers: baseHeaders,
      }

  return fetch(url, options)
}
