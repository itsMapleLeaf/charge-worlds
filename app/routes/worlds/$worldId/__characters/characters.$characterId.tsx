import { useParams } from "@remix-run/react"
import { EmptyState } from "~/ui/empty-state"
import { NotFoundMessage } from "~/ui/not-found-message"
import { useWorldState } from "~/world-state"

export default function CharacterPage() {
  const world = useWorldState()
  const params = useParams()

  if (!world.characters.length) {
    return (
      <EmptyState>
        <p>No characters found</p>
      </EmptyState>
    )
  }

  const character =
    world.characters.find((character) => character.id === params.characterId) ??
    world.characters[0]

  if (!character) {
    return <NotFoundMessage />
  }

  return (
    <>
      <h1>{character.name}</h1>
    </>
  )
}
