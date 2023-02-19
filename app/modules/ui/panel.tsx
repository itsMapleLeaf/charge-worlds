import clsx from "clsx"

export const panelStyle = clsx(
  "rounded-md border border-white/10 bg-black/50 shadow-md backdrop-blur",
)

export const interactivePanelStyle = clsx(
  panelStyle,
  "transition hover:border-foreground-8/50 hover:text-foreground-7 active:scale-95 active:duration-[0s]",
)
