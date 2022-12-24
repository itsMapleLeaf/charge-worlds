import { json, type LoaderArgs } from "@remix-run/node"
import { NavLink, Outlet, useLoaderData } from "@remix-run/react"
import { findSessionUser } from "~/auth.server"
import { db } from "~/db.server"
import { buttonStyle } from "~/ui/styles"

export async function loader({ request, params }: LoaderArgs) {
  const user = await findSessionUser(request)

  let membership
  if (user) {
    membership = await db.membership.findUnique({
      where: {
        worldId_userDiscordId: {
          worldId: params.worldId!,
          userDiscordId: user.discordId,
        },
      },
    })
  }

  const characters = await db.character.findMany({
    where:
      membership?.role === "OWNER"
        ? { worldId: params.worldId }
        : { worldId: params.worldId, hidden: false },
    select: { id: true, name: true },
  })

  return json({ characters })
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <nav className="mb-2 flex gap-2 overflow-x-auto whitespace-nowrap">
        {data.characters.map((character) => (
          <NavLink
            to={character.id}
            key={character.id}
            className={({ isActive }) => buttonStyle({ active: isActive })}
          >
            {character.name}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  )
}
