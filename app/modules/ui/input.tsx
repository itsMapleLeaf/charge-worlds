import { cx } from "class-variance-authority"
import { interactivePanel } from "~/modules/ui/panel"

export const input = () => cx(interactivePanel({ shadow: "none" }), "px-3 h-12")
