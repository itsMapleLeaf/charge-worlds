import type { JsonObject } from "@liveblocks/client"
import { join } from "node:path"
import { env } from "~/core/env.server"

const baseHeaders: Record<string, string> = {
  Authorization: `Bearer ${env.LIVEBLOCKS_SECRET_KEY}`,
}

const getApiUrl = (endpoint: string) =>
  new URL(join("/v2", endpoint), "https://api.liveblocks.io")

async function checkResponseError(response: Response) {
  if (!response.ok) {
    console.error(
      "Failed to create Liveblocks room",
      response.status,
      response.statusText,
      await response.json().catch(() => undefined),
    )
    throw new Response(undefined, { status: 500 })
  }
}

export async function liveblocksGet(endpoint: string) {
  const response = await fetch(getApiUrl(endpoint), {
    method: "GET",
    headers: baseHeaders,
  })
  await checkResponseError(response)
}

export async function liveblocksPost(endpoint: string, body: JsonObject) {
  const response = await fetch(getApiUrl(endpoint), {
    method: "POST",
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  await checkResponseError(response)
  return response.json()
}
