import { Dices } from "lucide-react"
import { clearButtonClass } from "../ui/styles"

export function CharacterActionRollButton({
  name,
  action,
  level,
}: {
  name: string
  action: string
  level: number
}) {
  return (
    <button
      title={`Roll ${action}`}
      className={clearButtonClass}
      onClick={() => {
        // setDiceRoll(level + 1, `${name}: ${action}`)
      }}
    >
      <Dices />
    </button>
  )
}
