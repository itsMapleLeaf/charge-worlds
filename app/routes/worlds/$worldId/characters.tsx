import { NavLink, Outlet } from "@remix-run/react"
import { buttonStyle } from "~/ui/styles"
import { useWorldState } from "~/world-state"

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
      </nav>
      <Outlet />
    </>
  )
}
