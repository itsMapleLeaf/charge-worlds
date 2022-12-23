import clsx from "clsx"

export const cardStyle = () =>
  clsx(
    "bg-black/75 transition-colors border-l-2 border-white/25 shadow-md block rounded-sm overflow-clip backdrop-blur",
  )

export const interactiveCardStyle = () =>
  clsx(
    "bg-black/75 hover:bg-black/100 transition-colors",
    "border-l-4 border-white/25 hover:border-accent-400",
    "shadow-md block rounded backdrop-blur",
    "overflow-clip",
  )

export function linkStyle({ underline = true } = {}) {
  return clsx(
    "transition-colors hover:text-accent-300",
    underline && "underline",
  )
}

export function buttonStyle({
  variant = "solid",
  rounded = true,
  active = false,
}: {
  variant?: "solid" | "clear"
  rounded?: boolean
  active?: boolean
} = {}) {
  return clsx(
    "transition",
    "p-3 inline-flex items-center gap-1.5",
    "uppercase tracking-wide leading-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "hover:text-accent-400",
    rounded && "rounded-sm",
    variant === "solid" && "bg-black/75 hover:bg-black",
    variant === "clear" && "hover:bg-white/10 hover:text-accent-400",

    "border-x-2 border-transparent",
    active && "text-accent-400 border-l-accent-400",
  )
}

export function inputStyle() {
  return clsx(
    "block border-b-2 border-white/25 bg-white/10 w-full leading-none p-3 focus:ring-0 rounded-sm focus:border-accent-400 transition-colors shadow-inner",
  )
}
