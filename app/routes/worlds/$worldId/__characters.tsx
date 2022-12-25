import { Link, Outlet, useFetcher, useParams } from "@remix-run/react"
import { UserPlus } from "lucide-react"
import { LoadingSpinner } from "~/ui/loading"
import { buttonStyle } from "~/ui/styles"
import { Tooltip } from "~/ui/tooltip"
import { useWorldState } from "~/world-state"

export default function CharacterListRoot() {
  const world = useWorldState()
  const params = useParams()

  const currentCharacter =
    world.characters.find((character) => character.id === params.characterId) ??
    world.characters[0]

  return (
    <>
      <nav className="mb-2 flex flex-wrap gap-2">
        {world.characters.map((character) => (
          <Link
            to={`characters/${character.id}`}
            key={character.id}
            className={buttonStyle({ active: character === currentCharacter })}
          >
            {character.name}
          </Link>
        ))}
        <AddCharacterButton />
      </nav>
      <Outlet />
    </>
  )
}

function AddCharacterButton() {
  const fetcher = useFetcher()
  return (
    <fetcher.Form method="post" action="add-character">
      <Tooltip text="Add character">
        <button
          title="Add character"
          className={buttonStyle()}
          disabled={fetcher.state !== "idle"}
        >
          {fetcher.state === "idle" ? (
            // it looks off-center lol
            <UserPlus className="translate-x-[2px]" />
          ) : (
            <LoadingSpinner size={6} />
          )}
        </button>
      </Tooltip>
    </fetcher.Form>
  )
}
