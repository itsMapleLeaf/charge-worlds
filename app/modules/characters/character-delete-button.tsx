import { Dialog, DialogDismiss, DialogHeading, useDialogState } from "ariakit"
import { cx } from "class-variance-authority"
import { Trash, X } from "lucide-react"
import { button } from "../ui/button"
import { panel } from "../ui/panel"

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
      <button className={button()} onClick={dialog.show}>
        <Trash />
        Delete
      </button>

      <Dialog
        state={dialog}
        className={cx(
          "m-auto flex flex-col items-center p-4 gap-4 transition data-[enter]:scale-100 data-[leave]:scale-90 data-[enter]:opacity-100 data-[leave]:opacity-0",
          panel(),
        )}
        backdropProps={{
          className: cx(
            "fixed inset-0 flex flex-col bg-black/50 backdrop-blur-md transition data-[enter]:opacity-100 data-[leave]:opacity-0",
          ),
        }}
      >
        <DialogHeading>
          Are you sure you want to delete {character.name}?
        </DialogHeading>
        <div className="flex items-center gap-4">
          <DialogDismiss className={button()}>
            <X />
            Cancel
          </DialogDismiss>
          <button
            className={button()}
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
