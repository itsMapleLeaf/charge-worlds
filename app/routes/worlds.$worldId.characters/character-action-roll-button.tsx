import { clearButtonClass } from "../../ui/styles"
import { setRoll } from "../worlds.$worldId.dice"

export function CharacterActionRollButton({
  title,
  intent,
  poolSize,
  children,
}: {
  title: string
  intent: string
  poolSize: number
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      className={clearButtonClass}
      onClick={() => setRoll(intent, poolSize)}
    >
      {children}
    </button>
  )
}
