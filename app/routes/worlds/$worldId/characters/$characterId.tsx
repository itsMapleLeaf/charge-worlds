import { useParams } from "@remix-run/react"
import { NotFoundMessage } from "~/ui/not-found-message"
import { useWorldState } from "~/world-state"

export default function CharacterPage() {
  const world = useWorldState()
  const params = useParams()
  const character = world.characters.find(
    (character) => character.id === params.characterId,
  )

  if (!character) {
    return <NotFoundMessage />
  }

  return (
    <div>
      <h1>{character.name}</h1>
    </div>
  )
}
