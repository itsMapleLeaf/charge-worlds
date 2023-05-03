import { setRoll } from "../dice/dice-panel"

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
      className="justify-center border-0 bg-transparent p-2 s-10 -m-2 button"
      onClick={() => setRoll(intent, poolSize)}
    >
      {children}
    </button>
  )
}
