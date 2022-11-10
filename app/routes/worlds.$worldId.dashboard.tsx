import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { db } from "../core/db.server"
import { parseKeys } from "../helpers/parse-keys"
import { ClocksManager } from "./worlds.$worldId.clocks"

export async function loader({ params }: LoaderArgs) {
  const { worldId } = parseKeys(params, ["worldId"])

  const clocks = await db.clock.findMany({
    where: { worldId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      progress: true,
      maxProgress: true,
    },
  })

  return json({ clocks })
}

export default function DashboardPage() {
  const data = useLoaderData<typeof loader>()
  return <ClocksManager clocks={data.clocks} />
}
