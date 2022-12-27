import clsx from "clsx"

type PanelOptions = {
  rounding?: "none" | "lg" | "full"
  borders?: "all" | "top" | "bottom" | "left" | "right"
  inactiveBorderColor?: "transparent" | "normal"
  background?: "translucent" | "none"
}

export const panelStyle = ({
  rounding = "lg",
  borders = "all",
  inactiveBorderColor = "normal",
  background = "translucent",
}: PanelOptions = {}) =>
  clsx(
    background === "translucent" && "bg-black/50 backdrop-blur-md",
    background === "none" && "bg-transparent",

    rounding === "lg" && "overflow-clip rounded-lg",
    rounding === "full" && "overflow-clip rounded-full",

    borders === "all" && "border",
    borders === "top" && "border-t",
    borders === "bottom" && "border-b",
    borders === "left" && "border-l",
    borders === "right" && "border-r",

    inactiveBorderColor === "transparent"
      ? "border-transparent"
      : "border-white/10",
  )

export const interactivePanelStyle = (options: PanelOptions = {}) =>
  clsx(
    "transition hover:bg-black/75 hover:text-accent-400 active:scale-[0.97] active:transition-none",
    panelStyle(options),
  )

export const linkStyle = ({ underline = true } = {}) =>
  clsx("transition-colors hover:text-accent-300", underline && "underline")

export const buttonStyle = ({
  size = 12,
  active = false,
  square,
  justify = "center",
  ...options
}: {
  size?: 10 | 12 | 14 | 16
  active?: boolean
  square?: boolean
  justify?: "center" | "start" | "end"
} & PanelOptions = {}) =>
  clsx(
    "inline-flex items-center gap-2 p-3 uppercase leading-none tracking-wide disabled:cursor-not-allowed disabled:opacity-50",
    size === 10 && "h-10",
    size === 12 && "h-12",
    size === 14 && "h-14",
    size === 16 && "h-16",
    active && "border-accent-400 text-accent-400",
    square && "aspect-square",
    justify === "center" && "justify-center",
    justify === "start" && "justify-start",
    justify === "end" && "justify-end",
    interactivePanelStyle(options),
  )

export const inputStyle = ({ interactive = true } = {}) =>
  clsx(
    "inline-flex h-12 w-full items-center p-3 leading-none shadow-inner",

    // for when we want to match the style of an input, but not make it interactive
    interactive && "focus:border-accent-400 focus:outline-none",
    interactive ? interactivePanelStyle() : panelStyle(),
  )

export const labelStyle = () => clsx("text-sm font-medium leading-none")
