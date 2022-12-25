import { type ActionArgs } from "@remix-run/node"
import { Form, NavLink, Outlet } from "@remix-run/react"
import { UserPlus } from "lucide-react"
import { getSession } from "~/auth.server"
import { db } from "~/db.server"
import { raise } from "~/helpers/errors"
import { forbidden, redirectBack, unauthorized } from "~/helpers/responses"
import { buttonStyle } from "~/ui/styles"
import { useWorldState } from "~/world-state"

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

  db.$transaction(async (tx) => {
    const count = await tx.character.count({
      where: { worldId: params.worldId! },
    })
    await db.character.create({
      data: {
        name: `New Character ${count + 1}`,
        worldId: params.worldId!,
        ownerId: user.id,
      },
    })
  })

  return redirectBack(request)
}

export default function CharacterListPage() {
  const world = useWorldState()
  return (
    <>
      <nav className="mb-2 flex gap-2 overflow-x-auto whitespace-nowrap">
        {world.characters.map((character) => (
          <NavLink
            to={character.id}
            key={character.id}
            className={({ isActive }) => buttonStyle({ active: isActive })}
          >
            {character.name}
          </NavLink>
        ))}
        <Form method="post">
          <button className={buttonStyle()}>
            {/* it looks off-center lol */}
            <UserPlus className="translate-x-[2px]" />
          </button>
        </Form>
      </nav>
      <Outlet />
    </>
  )
}
