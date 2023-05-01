import * as RadixPopover from "@radix-ui/react-popover"
import clsx from "clsx"
import { Palette } from "lucide-react"
import { button } from "../ui/button"
import { activePressClass } from "../ui/styles"
import { characterColors } from "./character-colors"

export function CharacterColorButton({
  onSelectColor,
}: {
  onSelectColor: (color: string) => void
}) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger className={button()}>
        <Palette /> Color
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className="animate-from-opacity-0 animate-from-scale-90 data-[state=open]:animate-in data-[state=closed]:animate-out w-64 origin-[var(--radix-popover-content-transform-origin)] scale-90 panel p-4 opacity-0 transition"
          collisionPadding={8}
          sideOffset={8}
          align="start"
        >
          <RadixPopover.Arrow className="fill-black/50" />
          <div className="grid auto-rows-[3rem] grid-cols-3 gap-2">
            {Object.entries(characterColors).map(([name, classes]) => (
              <button
                key={name}
                className={clsx(
                  classes.background,
                  classes.border,
                  "rounded-md border ring-2 ring-transparent brightness-150 transition hover:brightness-100 focus:outline-none focus-visible:ring-blue-500",
                  activePressClass,
                )}
                onClick={() => onSelectColor(name)}
              />
            ))}
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
