import { Eye, EyeOff } from "lucide-react"
import { solidButtonClass } from "../ui/styles"
import type { Character } from "./character-schema"

export function CharacterHideButton({
  hidden,
  onHiddenChange,
}: {
  hidden: Character["hidden"]
  onHiddenChange: (hidden: boolean) => void
}) {
  return (
    <button
      className={solidButtonClass}
      onClick={() => onHiddenChange(!hidden)}
    >
      {hidden ? <Eye /> : <EyeOff />}
      {hidden ? "Unhide" : "Hide"}
    </button>
  )
}
