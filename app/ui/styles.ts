import clsx from "clsx"

export const maxWidthContainerClass = clsx(
  "mx-auto w-full max-w-screen-md px-4",
)

export const clearButtonClass = clsx(
  "hover:text-blue-300 ring-inset",
  "focus:outline-none focus:ring-2 focus:ring-inset focus-within:ring-2 focus-within:ring-inset [&_*:focus]:outline-none ring-blue-300",
  "uppercase inline-flex items-center gap-1 text-lg p-2 -m-2",
  "transition-transform active:transition-none active:scale-95",
)
