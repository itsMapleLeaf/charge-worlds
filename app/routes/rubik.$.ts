import type { LoaderArgs } from "@remix-run/server-runtime"
import { readFile } from "node:fs/promises"
import { join, resolve } from "node:path"

export async function loader({ params }: LoaderArgs) {
  const rootPath = resolve("node_modules/@fontsource/rubik")
  const fullPath = join(rootPath, params["*"]!)
  if (!fullPath.startsWith(rootPath)) {
    throw new Response(undefined, { status: 403 })
  }

  const content = await readFile(fullPath)
  return new Response(content.buffer, {
    headers: {
      "Content-Type": getContentType(fullPath) ?? "",
      "Cache-Control": `public, max-age=${60 * 60 * 24 * 7}`,
    },
  })
}

function getContentType(path: string) {
  if (path.endsWith(".woff2")) return "font/woff2"
  if (path.endsWith(".woff")) return "font/woff"
  if (path.endsWith(".ttf")) return "font/ttf"
  if (path.endsWith(".svg")) return "image/svg+xml"
  if (path.endsWith(".css")) return "text/css"
}
