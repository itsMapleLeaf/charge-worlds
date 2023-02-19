import { useParams } from "@remix-run/react"

export default function CharacterPage() {
  const params = useParams()
  return <p>Character {params.characterId}</p>
}
