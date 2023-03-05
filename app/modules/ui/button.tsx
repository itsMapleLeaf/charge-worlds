import { cx } from "class-variance-authority"
import type { InteractableProps, PanelProps } from "./panel"
import { interactable, interactivePanel } from "./panel"

export const button = ({
  size = 12,
  ...props
}: PanelProps & InteractableProps & { size?: 8 | 10 | 12 } = {}) =>
  cx(
    "inline-flex items-center gap-2 px-3 [&>svg]:s-5",
    size === 8 ? "h-8" : "",
    size === 10 ? "h-10" : "",
    size === 12 ? "h-12" : "",
    interactivePanel({ shadow: "none", ...props }),
  )

export const squareButton = (props?: PanelProps) =>
  cx(interactivePanel(props), "inline-flex items-center justify-center s-12")

export const circleButton = cx(
  interactivePanel({ border: "circle" }),
  "inline-flex items-center justify-center s-12",
)

export const clearButton = () =>
  cx("inline-flex items-center gap-2 [&>svg]:s-5", interactable())
