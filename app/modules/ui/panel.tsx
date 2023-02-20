import type { VariantProps } from "class-variance-authority"
import { cva, cx } from "class-variance-authority"

export type PanelProps = VariantProps<typeof panel>

export const panel = cva("", {
  variants: {
    background: {
      default: "bg-black/75 backdrop-blur-md",
      none: "",
    },
    border: {
      default: "border border-white/10 rounded-md",
      circle: "border border-white/10 rounded-full",
      left: "border-l border-white/10",
      right: "border-r border-white/10",
      top: "border-t border-white/10",
      bottom: "border-b border-white/10",
      none: "",
    },
    shadow: {
      default: "shadow-md shadow-black/25",
      none: "",
    },
  },
  defaultVariants: {
    background: "default",
    border: "default",
    shadow: "default",
  },
})

export type InteractableProps = {
  cursor?: "pointer" | "unset"
  active?: boolean
}

export const interactable = ({ cursor, active }: InteractableProps = {}) =>
  cx(
    "transition hover:border-foreground-8/50 hover:text-foreground-7 active:translate-y-0.5 active:duration-[0s] select-none",
    cursor === "unset" ? "" : "cursor-pointer",
    active ? "border-foreground-8/50 text-foreground-7" : "",
  )

export const interactivePanel = (props?: PanelProps & InteractableProps) =>
  cx(panel(props), interactable(props))
