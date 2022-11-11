import { Button } from "ariakit/button"
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  usePopoverState,
} from "ariakit/popover"
import clsx from "clsx"
import { Palette } from "lucide-react"
import { activePressClass, solidButtonClass } from "../../ui/styles"
import { characterColors } from "./character-colors"

export function CharacterColorButton({
  onSelectColor,
}: {
  onSelectColor: (color: string) => void
}) {
  const popover = usePopoverState({
    placement: "top-start",
    animated: true,
  })

  return (
    <>
      <PopoverDisclosure state={popover} className={solidButtonClass}>
        <Palette /> Color
      </PopoverDisclosure>
      <Popover
        state={popover}
        className={clsx(
          "w-80 origin-bottom-left scale-90 rounded-md bg-black/50 p-4 opacity-0 transition [&[data-enter]]:scale-100 [&[data-enter]]:opacity-100",
        )}
      >
        <PopoverArrow className="[&_path]:fill-black/50 [&_path]:stroke-black/50" />
        <div className="grid auto-rows-[2rem] grid-cols-5 gap-2">
          {Object.entries(characterColors).map(([name, classes]) => (
            <Button
              key={name}
              className={clsx(
                classes.background,
                "rounded-md ring-2 ring-transparent brightness-150 transition hover:brightness-100 focus:outline-none focus-visible:ring-blue-500",
                activePressClass,
              )}
              onClick={() => onSelectColor(name)}
            />
          ))}
        </div>
      </Popover>
    </>
  )
}
