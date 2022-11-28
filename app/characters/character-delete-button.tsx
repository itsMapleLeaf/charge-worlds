import { Dialog, DialogDismiss, DialogHeading, useDialogState } from "ariakit"
import clsx from "clsx"
import { Trash, X } from "lucide-react"
import { solidButtonClass } from "../ui/styles"

export function CharacterDeleteButton({
  character,
  onDelete,
}: {
  character: { name: string }
  onDelete: () => void
}) {
  const dialog = useDialogState({ animated: true })
  return (
    <>
      <button className={solidButtonClass} onClick={dialog.show}>
        <Trash />
        Delete
      </button>

      <Dialog
        state={dialog}
        className="pointer-events-auto m-auto flex flex-col items-center gap-4 rounded-md bg-gray-700 p-4 shadow-md transition data-[enter]:scale-100 data-[leave]:scale-90 data-[enter]:opacity-100 data-[leave]:opacity-0"
        backdropProps={{
          className: clsx(
            "fixed inset-0 flex flex-col bg-black/50 transition data-[enter]:opacity-100 data-[leave]:opacity-0",
          ),
        }}
      >
        <DialogHeading>
          Are you sure you want to delete {character.name}?
        </DialogHeading>
        <div className="flex items-center gap-4">
          <DialogDismiss className={solidButtonClass}>
            <X />
            Cancel
          </DialogDismiss>
          <button
            className={solidButtonClass}
            onClick={() => {
              dialog.hide()
              onDelete()
            }}
          >
            <Trash />
            Delete
          </button>
        </div>
      </Dialog>
    </>
  )
}
