import clsx from "clsx"

export const maxWidthContainerClass = clsx(
  "mx-auto w-full max-w-screen-md px-4",
)


export const activePressClass = clsx(
  "transition-transform active:transition-none active:scale-95",
)

export const clearButtonClass = clsx(
  "hover:text-blue-300 ring-inset",
  "focus:outline-none focus-visible:ring-2 ring-blue-300 [&_*:focus]:outline-none",
  "uppercase inline-flex items-center gap-2 text-lg p-2 -m-2",
  activePressClass,
)

export const solidButtonClass = clsx(
  "inline-flex items-center gap-2 rounded-md bg-black/25 p-3 leading-none ring-blue-500 hover:bg-black/40 focus:outline-none focus-visible:ring-2",
  activePressClass,
)

export const menuPanelClass = clsx(
  "bg-slate-600 flex flex-col rounded-md max-w-[16rem] shadow-lg overflow-clip min-w-[10rem] transition duration-100 origin-top data-[enter]:scale-100 data-[enter]:opacity-100 data-[leave]:opacity-0 data-[leave]:scale-95",
)

export const menuItemClass = clsx(
  "block p-3 data-[active-item]:bg-black/25 cursor-pointer",
)

export const navLinkClass = ({ isActive = false } = {}) =>
  clsx(
    "inline-flex items-center gap-1.5 border-b-2 text-lg uppercase transition",
    activePressClass,
    isActive
      ? "border-current"
      : "border-transparent opacity-50 hover:opacity-75",
  )

export const dividerClass = "border-black/25"

export const inputBaseClass = clsx(
  "block w-full resize-none rounded-md bg-black/25 transition focus:bg-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500",
)

export const inputClass = clsx(
  inputBaseClass,
  "inline-flex min-h-[3rem] flex-wrap items-center p-3 leading-tight",
)

export const textAreaClass = clsx(inputBaseClass, "p-3")

export const labelTextClass = clsx("mb-1.5 text-sm font-medium leading-none")
