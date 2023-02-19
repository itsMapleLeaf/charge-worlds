import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { AppHeader } from "~/modules/app/app-header"
import { getSessionUser } from "~/modules/auth/session.server"
import { db } from "../modules/app/db.server"

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  if (!user) {
    return json({})
  }

  const worlds = await db.world.findMany({
    where: {
      memberships: {
        some: {
          userDiscordId: user.discordId,
        },
      },
    },
  })

  return json({ worlds })
}

export default function WorldList() {
  return (
    <>
      <AppHeader title="Your Worlds" breadcrumbs={[]} />
    </>
  )
}
