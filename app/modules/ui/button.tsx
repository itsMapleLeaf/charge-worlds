import clsx from "clsx"
import { interactivePanelStyle } from "./panel"

export const buttonStyle = clsx(
  interactivePanelStyle,
  "inline-flex h-12 items-center gap-2 px-3 [&>svg]:s-5",
)
