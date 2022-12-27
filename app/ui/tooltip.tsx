import * as ariakit from "ariakit"
import { type ReactNode } from "react"
import { useHasHover } from "~/helpers/use-has-hover"

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
    fixed: true, // absolute positioning makes scrollbars
  })

  // tooltips are not useful on touch devices
  const hasHover = useHasHover()
  if (!hasHover) {
    return <>{props.children}</>
  }

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
        className="pointer-events-none rounded bg-white p-1 text-sm leading-none text-gray-900 drop-shadow transition data-[enter]:scale-100 data-[leave]:scale-95 data-[leave]:opacity-0 data-[enter]:opacity-100"
      >
        <ariakit.TooltipArrow />
        {props.text}
      </ariakit.Tooltip>
    </>
  )
}
