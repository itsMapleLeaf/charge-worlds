import { join } from "node:path"
import { env } from "~/core/env.server"

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

type JsonInput =
  | string
  | number
  | boolean
  | null
  | { readonly [property: string]: JsonInput }
  | readonly JsonInput[]

export async function liveblocksPost(endpoint: string, body: JsonInput) {
  return fetch(getApiUrl(endpoint), {
    method: "POST",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}
