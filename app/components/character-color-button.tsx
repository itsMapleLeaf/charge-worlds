import * as RadixPopover from "@radix-ui/react-popover"
import { Palette } from "lucide-react"
import { rgba } from "polished"
import { characterColors } from "../data/character-colors"

export function CharacterColorButton({
  onSelectColor,
}: {
  onSelectColor: (color: string) => void
}) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger className="button panel">
        <Palette /> Color
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className="radix-zoom-fade-transition panel glass w-64 origin-[var(--radix-popover-content-transform-origin)] p-4"
          collisionPadding={8}
          sideOffset={4}
          align="start"
        >
          <div className="grid auto-rows-[3rem] grid-cols-3 gap-2">
            {Object.entries(characterColors).map(([name, classes]) => (
              <button
                key={name}
                className="button panel hover:brightness-125"
                style={{
                  backgroundColor: classes.background,
                  borderColor: rgba(classes.border, 0.5),
                }}
                onClick={() => onSelectColor(name)}
              >
                <span className="sr-only">{name}</span>
              </button>
            ))}
          </div>
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
