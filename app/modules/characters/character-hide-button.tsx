import { Eye, EyeOff } from "lucide-react"
import { button } from "../ui/button"

export function CharacterHideButton({
  hidden,
  onHiddenChange,
}: {
  hidden: boolean
  onHiddenChange: (hidden: boolean) => void
}) {
  return (
    <button className={button()} onClick={() => onHiddenChange(!hidden)}>
      {hidden ? <Eye /> : <EyeOff />}
      {hidden ? "Unhide" : "Hide"}
    </button>
  )
}
