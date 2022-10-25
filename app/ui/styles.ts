import clsx from "clsx"

export const maxWidthContainerClass = clsx(
  "mx-auto w-full max-w-screen-md px-4",
)

export const activePressClass =
  "transition-transform active:transition-none active:scale-95"

export const clearButtonClass = clsx(
  "hover:text-blue-300 ring-inset",
  "focus:outline-none focus-visible:ring-2 [&_*:focus]:outline-none ring-blue-300",
  "uppercase inline-flex items-center gap-2 text-lg p-2 -m-2",
  activePressClass,
)

export const menuPanelClass = clsx(
  "bg-slate-600 flex flex-col rounded-md shadow-lg overflow-clip min-w-[10rem] transition duration-100 origin-top data-[enter]:scale-100 data-[enter]:opacity-100 data-[leave]:opacity-0 data-[leave]:scale-95",
)

export const menuItemClass = clsx(
  "leading-none p-3 data-[active-item]:bg-black/25 cursor-pointer",
)
