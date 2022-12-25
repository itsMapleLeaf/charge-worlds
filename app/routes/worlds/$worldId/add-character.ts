import { redirect, type ActionArgs } from "@remix-run/node"
import { getSession } from "~/auth.server"
import { db } from "~/db.server"
import { raise } from "~/helpers/errors"
import { forbidden, unauthorized } from "~/helpers/responses"

export async function action({ request, params }: ActionArgs) {
  const { sessionId } = (await getSession(request)) ?? raise(unauthorized())

  const user = await db.user.findUnique({
    where: { sessionId },
    select: {
      id: true,
      memberships: {
        where: { worldId: params.worldId! },
      },
    },
  })

  if (!user?.memberships.length) {
    throw forbidden()
  }

  const character = await db.$transaction(async (tx) => {
    const count = await tx.character.count({
      where: { worldId: params.worldId! },
    })
    return await db.character.create({
      data: {
        name: `New Character ${count + 1}`,
        worldId: params.worldId!,
        ownerId: user.id,
      },
      select: { id: true },
    })
  })

  return redirect(`../characters/${character.id}`)
}
