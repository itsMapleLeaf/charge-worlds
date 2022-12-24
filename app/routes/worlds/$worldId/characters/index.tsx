import { type LoaderArgs, redirect } from "@remix-run/node"
import { db } from "~/db.server"
import { EmptyState } from "~/ui/empty-state"

export async function loader({ params }: LoaderArgs) {
  const firstCharacter = await db.character.findFirst({
    where: { worldId: params.worldId },
    select: { id: true },
  })
  if (firstCharacter) {
    return redirect(firstCharacter.id, 303)
  }

  return new Response(undefined)
}

export default function CharactersIndex() {
  return (
    <EmptyState>
      <p>No characters found</p>
    </EmptyState>
  )
}
