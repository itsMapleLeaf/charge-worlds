import { cx } from "class-variance-authority"
import { interactivePanel } from "~/modules/ui/panel"

const inputFocusRing = cx("ring-inset focus:ring-1 focus:ring-foreground-8/75")

export const input = () =>
  cx(
    "px-3 h-12 block w-full cursor-text",
    inputFocusRing,
    interactivePanel({ shadow: "none", cursor: "unset" }),
  )

export const textArea = () =>
  cx(
    "px-3 py-2 min-h-12 block",
    inputFocusRing,
    interactivePanel({ shadow: "none", cursor: "unset" }),
  )

export const checkbox = () =>
  cx(
    "relative appearance-none s-5 after:bg-foreground-8 after:absolute after:inset-0.5 after:rounded-[3px] after:invisible checked:after:visible transition cursor-pointer",
    interactivePanel({ shadow: "none" }),
  )
