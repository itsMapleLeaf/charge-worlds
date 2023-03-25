import clsx from "clsx"

export const maxWidthContainerClass = clsx(
  "mx-auto w-full max-w-screen-md px-4",
)

export const activePressClass = clsx(
  "transition-transform active:scale-95 active:transition-none",
)

export const clearButtonClass = clsx(
  "ring-inset hover:text-blue-300",
  "rounded-md ring-blue-500 focus:outline-none focus-visible:ring-2 [&_*:focus]:outline-none",
  "-m-2 inline-flex items-center gap-2 p-2 text-lg uppercase",
  "leading-none",
  activePressClass,
)

export const solidButtonClass = clsx(
  "inline-flex items-center gap-2 rounded-md bg-black/25 p-3 leading-none ring-blue-500 hover:bg-black/40 focus:outline-none focus-visible:ring-2",
  activePressClass,
)

export const menuPanelClass = clsx(
  "flex min-w-[10rem] max-w-[16rem] origin-top flex-col overflow-clip rounded-md bg-foreground-1 text-neutral-1 shadow-lg transition duration-100 data-[enter]:scale-100 data-[leave]:scale-95 data-[enter]:opacity-100 data-[leave]:opacity-0",
)

export const menuItemClass = clsx(
  "block cursor-pointer p-3 transition data-[active-item]:bg-black/25",
)

export const navLinkClass = ({ isActive = false } = {}) =>
  clsx(
    "inline-flex items-center gap-1.5 border-b-2 text-lg uppercase transition",
    activePressClass,
    isActive
      ? "border-current"
      : "border-transparent opacity-50 hover:opacity-75",
  )

export const dividerClass = "border-white/10"

export const inputBaseClass = clsx(
  "block w-full resize-none rounded-md bg-black/25 transition focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500",
)

export const inputClass = clsx(
  inputBaseClass,
  "inline-flex min-h-[theme(spacing.12)] flex-wrap items-center p-3 leading-tight",
  "border-red-400 [&:not(:placeholder-shown)]:invalid:border",
)

export const checkboxClass = clsx(
  "relative h-5 w-5 appearance-none rounded bg-black/40 ring-blue-500 after:absolute after:inset-[3px] after:rounded-sm checked:after:bg-blue-400 hover:bg-black/70 focus:outline-none focus-visible:ring-2",
)

export const textAreaClass = clsx(inputBaseClass, "p-3")

export const labelTextClass = clsx("text-sm font-medium leading-none")

export const errorTextClass = clsx("text-sm text-red-400")
