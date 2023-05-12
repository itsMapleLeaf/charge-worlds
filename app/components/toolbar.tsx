import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

export function Toolbar(props: { children: ReactNode }) {
  return <div className="grid auto-cols-fr grid-flow-col">{props.children}</div>
}

export function ToolbarButton(props: {
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      title={props.label}
      className="h-10 justify-center border-none bg-transparent button"
      onClick={props.onClick}
    >
      <props.icon aria-hidden className="!s-4" />
    </button>
  )
}
