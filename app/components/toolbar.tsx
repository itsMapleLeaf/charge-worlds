import { type LucideIcon } from "lucide-react"
import { type ComponentProps, type ReactNode } from "react"
import { autoRef } from "~/helpers/react"
import { type Merge } from "~/helpers/types"

export function Toolbar(props: { children: ReactNode }) {
  return <div className="grid auto-cols-fr grid-flow-col">{props.children}</div>
}

export const ToolbarButton = autoRef(function ToolbarButton({
  label,
  icon: Icon,
  ...props
}: Merge<
  ComponentProps<"button">,
  {
    label: string
    icon: LucideIcon
  }
>) {
  return (
    <button title={label} className="button h-10 justify-center" {...props}>
      <Icon aria-hidden className="!s-4" />
    </button>
  )
})
