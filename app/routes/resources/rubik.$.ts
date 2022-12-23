import { type LoaderArgs } from "@remix-run/node"
import { lookup } from "mime-types"
import { readFile } from "node:fs/promises"
import { join, normalize } from "node:path"

export function loader({ params }: LoaderArgs) {
  return serveFile("node_modules/@fontsource/rubik", params["*"]!)
}

async function serveFile(root: string, file: string) {
  const path = join(root, file)
  if (!path.startsWith(normalize(root))) {
    return new Response("Not found", { status: 404 })
  }

  return new Response(await readFile(path), {
    headers: {
      "Content-Type": lookup(path) || "application/octet-stream",
      "Cache-Control": "public, max-age=604800",
    },
  })
}
