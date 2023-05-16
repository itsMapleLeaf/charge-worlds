import { setRoll } from "./dice-panel"

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
      className="button -m-2 justify-center border-0 bg-transparent p-2 s-10"
      onClick={() => setRoll(intent, poolSize)}
    >
      {children}
    </button>
  )
}
