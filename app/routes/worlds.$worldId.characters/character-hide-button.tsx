import { Eye, EyeOff } from "lucide-react"
import { solidButtonClass } from "../../ui/styles"

export function CharacterHideButton({
  hidden,
  onHiddenChange,
}: {
  hidden: boolean
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
