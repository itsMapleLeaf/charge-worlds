import { cx } from "class-variance-authority"
import clsx from "clsx"
import type { PanelProps } from "./panel"
import { interactive, interactivePanel } from "./panel"

export const button = ({
  size = 12,
  ...props
}: PanelProps & { size?: 8 | 10 | 12 } = {}) =>
  clsx(
    interactivePanel(props),
    "inline-flex items-center gap-2 px-3 [&>svg]:s-5",
    size === 8 && "h-8",
    size === 10 && "h-10",
    size === 12 && "h-12",
  )

export const squareButton = (props?: PanelProps) =>
  clsx(interactivePanel(props), "inline-flex items-center justify-center s-12")

export const circleButton = clsx(
  interactivePanel({ border: "circle" }),
  "inline-flex items-center justify-center s-12",
)

export const clearButton = () => cx(interactive())
