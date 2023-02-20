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
      default: "shadow-md shadow-black/50",
      none: "",
    },
  },
  defaultVariants: {
    background: "default",
    border: "default",
    shadow: "default",
  },
})

export const interactive =
  "transition hover:border-foreground-8/50 hover:text-foreground-7 active:translate-y-0.5 active:duration-[0s] select-none cursor-pointer"

export const interactivePanel = (props?: PanelProps) =>
  cx(panel(props), interactive)
