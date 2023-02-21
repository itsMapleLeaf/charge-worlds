import * as RadixDialog from "@radix-ui/react-dialog"
import clsx from "clsx"
import { SidebarClose } from "lucide-react"
import { circleButton } from "~/modules/ui/button"

export function Dialog(props: { children: React.ReactNode }) {
  return <RadixDialog.Root>{props.children}</RadixDialog.Root>
}

export function DialogButton(props: RadixDialog.DialogTriggerProps) {
  return <RadixDialog.Trigger {...props} />
}

export function DialogOverlay(props: { children: React.ReactNode }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 flex flex-col bg-black/50 p-4 backdrop-blur-md animate-from-opacity-0 animation-duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out">
        {props.children}
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  )
}

export function DialogModalPanel(props: { children: React.ReactNode }) {
  return (
    <RadixDialog.Content className="panel m-auto flex w-full max-w-lg flex-col divide-y divide-white/10 animate-from-scale-x-95 animation-duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out">
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
        "panel fixed inset-y-0 flex w-64 flex-col overflow-y-scroll animation-duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:animation-ease-in",
        props.side === "left" &&
          "panel-border-right left-0 animate-from-translate-x-[-100%]",
        props.side === "right" &&
          "panel-border-left right-0 animate-from-translate-x-full",
      )}
    >
      <div className="flex-1">{props.children}</div>
      <div className="sticky bottom-0 p-4">
        <DialogClose className={circleButton} title="Dismiss">
          <SidebarClose />
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
