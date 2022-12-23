import clsx from "clsx"

export const cardStyle = () =>
  clsx(
    "block overflow-clip rounded-sm border-l-2 border-white/25 bg-black/75 shadow-md backdrop-blur transition-colors",
  )

export const interactiveCardStyle = () =>
  clsx(
    "block overflow-clip rounded border-l-4 border-white/25 bg-black/75 shadow-md backdrop-blur transition-colors hover:border-accent-400 hover:bg-black/100",
  )

export function linkStyle({ underline = true } = {}) {
  return clsx(
    "transition-colors hover:text-accent-300",
    underline && "underline",
  )
}

export function buttonStyle({
  variant = "solid",
  shape = "rounded",
  active = false,
}: {
  variant?: "solid" | "clear"
  shape?: "rounded" | "square" | "circle"
  active?: boolean
} = {}) {
  return clsx(
    "inline-flex items-center gap-1.5 border-x-2 border-transparent p-3 uppercase leading-none tracking-wide transition hover:text-accent-400 disabled:cursor-not-allowed disabled:opacity-50",
    variant === "solid" && "bg-black/75 hover:bg-black",
    variant === "clear" && "hover:bg-white/10 hover:text-accent-400",
    shape === "rounded" && "rounded-sm",
    shape === "circle" && "rounded-full s-14",
    active && "border-l-accent-400 text-accent-400",
  )
}

export function inputStyle() {
  return clsx(
    "block w-full rounded-sm border-b-2 border-white/25 bg-white/10 p-3 leading-none shadow-inner transition-colors focus:border-accent-400 focus:ring-0",
  )
}
