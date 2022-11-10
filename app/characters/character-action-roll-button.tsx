import { setRoll } from "../routes/worlds.$worldId.dice"
import { clearButtonClass } from "../ui/styles"

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
