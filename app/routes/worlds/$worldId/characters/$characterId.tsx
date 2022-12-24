import { type LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { db } from "~/db.server"
import { notFound } from "~/helpers/responses"

export async function loader({ params }: LoaderArgs) {
  const character = await db.character
    .findUnique({
      where: { id: params.characterId },
      select: { id: true, name: true },
    })
    .then((character) => character ?? Promise.reject(notFound()))
  return { character }
}

export default function CharacterPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div>
      <h1>{data.character.name}</h1>
    </div>
  )
}
