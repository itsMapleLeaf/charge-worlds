import clsx from "clsx"
import { interactivePanel } from "./panel"

export const button = clsx(
  interactivePanel(),
  "inline-flex h-12 items-center gap-2 px-3 [&>svg]:s-5",
)

export const circleButton = clsx(
  interactivePanel({ border: "circle" }),
  "inline-flex items-center justify-center s-12",
)
