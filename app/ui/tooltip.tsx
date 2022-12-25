import * as ariakit from "ariakit"
import { type ReactNode } from "react"

export function Tooltip(props: {
  children: ReactNode
  text: ReactNode
  placement?: ariakit.PopoverState["placement"]
  inline?: boolean
}) {
  const tooltip = ariakit.useTooltipState({
    animated: true,
    gutter: 4,
    timeout: 300,
    placement: props.placement ?? "bottom",
  })
  return (
    <>
      <ariakit.TooltipAnchor
        state={tooltip}
        as="span"
        className={props.inline ? "inline-block" : "block"}
      >
        {props.children}
      </ariakit.TooltipAnchor>
      <ariakit.Tooltip
        state={tooltip}
        as="div"
        className="pointer-events-none rounded bg-white p-1 text-xs leading-none text-gray-900 drop-shadow transition data-[enter]:translate-y-0 data-[leave]:translate-y-1 data-[leave]:opacity-0 data-[enter]:opacity-100"
      >
        <ariakit.TooltipArrow />
        {props.text}
      </ariakit.Tooltip>
    </>
  )
}
