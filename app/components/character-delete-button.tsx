import { Trash, X } from "lucide-react"
import {
  Dialog,
  DialogButton,
  DialogClose,
  DialogModalPanel,
  DialogOverlay,
} from "./dialog"

export function CharacterDeleteButton({
  character,
  onDelete,
}: {
  character: { name: string }
  onDelete: () => void
}) {
  return (
    <Dialog>
      <DialogButton className="button panel">
        <Trash />
        Delete
      </DialogButton>
      <DialogOverlay>
        <DialogModalPanel>
          <div className="grid gap-3 p-3 text-center">
            <p>Are you sure you want to delete {character.name}?</p>
            <div className="flex items-center justify-center gap-4">
              <DialogClose className="button panel">
                <X />
                Cancel
              </DialogClose>
              <DialogClose className="button panel" onClick={onDelete}>
                <Trash />
                Delete
              </DialogClose>
            </div>
          </div>
        </DialogModalPanel>
      </DialogOverlay>
    </Dialog>
  )
}
