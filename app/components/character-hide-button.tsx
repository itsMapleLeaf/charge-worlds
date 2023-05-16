import { Eye, EyeOff } from "lucide-react"

export function CharacterHideButton({
  hidden,
  onHiddenChange,
}: {
  hidden: boolean
  onHiddenChange: (hidden: boolean) => void
}) {
  return (
    <button className="button panel" onClick={() => onHiddenChange(!hidden)}>
      {hidden ? <Eye /> : <EyeOff />}
      {hidden ? "Unhide" : "Hide"}
    </button>
  )
}
