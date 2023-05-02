import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import { SidebarClose } from "lucide-react"
import { circleButton } from "~/modules/ui/button"

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
      <RadixDialog.Overlay className="fixed inset-0 flex flex-col bg-black/50 p-4 backdrop-blur-md data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in animate-duration-150!">
        {props.children}
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  )
}

export function DialogModalPanel(props: { children: React.ReactNode }) {
  return (
    <RadixDialog.Content className="radix-transition m-auto max-h-full max-w-lg w-full flex flex-col overflow-y-auto divide-y divide-white/10 panel">
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
        ":uno: fixed inset-y-0 w-64 flex flex-col overflow-y-scroll rounded-0 animate-duration-300! animate-ease! panel",
        props.side === "left" &&
          ":uno: left-0 border-0 border-r data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left",
        props.side === "right" &&
          ":uno: right-0 border-0 border-l data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right",
      )}
    >
      <div className="flex-1">{props.children}</div>
      <div
        data-side={props.side}
        className="sticky bottom-0 p-4 data-[side=right]:self-end"
      >
        <DialogClose className={circleButton} title="Dismiss">
          <SidebarClose
            data-side={props.side}
            className="data-[side=right]:-scale-x-100"
          />
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
