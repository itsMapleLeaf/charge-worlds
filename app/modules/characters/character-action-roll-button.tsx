import { setRoll } from "../dice/dice-module"
import { clearButton } from "../ui/button"

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
      className={clearButton()}
      onClick={() => setRoll(intent, poolSize)}
    >
      {children}
    </button>
  )
}
