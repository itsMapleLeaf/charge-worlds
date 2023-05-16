import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import { SidebarClose } from "lucide-react"

export type DialogProps = {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog(props: DialogProps) {
  return <RadixDialog.Root {...props} />
}

export function DialogButton(props: RadixDialog.DialogTriggerProps) {
  return <RadixDialog.Trigger {...props} />
}

export function DialogOverlay(props: { children: React.ReactNode }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="radix-fade-transition fixed inset-0 flex flex-col bg-black/75 p-4 fancy:bg-black/50 fancy:backdrop-blur-md">
        {props.children}
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  )
}

export function DialogModalPanel(props: { children: React.ReactNode }) {
  return (
    <RadixDialog.Content className="radix-zoom-fade-transition panel glass panel-divide-y m-auto flex max-h-full w-full max-w-lg flex-col overflow-y-auto">
      {props.children}
    </RadixDialog.Content>
  )
}

export function DialogDrawerPanel(props: {
  children: React.ReactNode
  side: "left" | "right"
}) {
  return (
    <RadixDialog.Content
      className={clsx(
        "panel glass group fixed inset-y-0 flex w-64 flex-col overflow-y-scroll ",
        props.side === "left" &&
          "radix-slide-left-transition panel-border-r left-0",
        props.side === "right" &&
          "radix-slide-right-transition panel-border-l right-0",
      )}
      data-side={props.side}
    >
      <div className="flex-1">{props.children}</div>
      <div className="sticky bottom-0 p-4 group-data-[side=right]:self-end">
        <DialogClose className="button panel rounded-full" title="Dismiss">
          <SidebarClose className="group-data-[side=right]:-scale-x-100" />
        </DialogClose>
      </div>
    </RadixDialog.Content>
  )
}

export function DialogClose(props: RadixDialog.DialogCloseProps) {
  return <RadixDialog.Close {...props} />
}

export function DialogTitle(props: RadixDialog.DialogTitleProps) {
  return <RadixDialog.Title {...props} />
}
