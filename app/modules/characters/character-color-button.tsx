import { Button } from "ariakit/button"
import {
  Popover,
  PopoverArrow,
  PopoverDisclosure,
  usePopoverState,
} from "ariakit/popover"
import clsx from "clsx"
import { Palette } from "lucide-react"
import { button } from "../ui/button"
import { panel } from "../ui/panel"
import { activePressClass } from "../ui/styles"
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
      <PopoverDisclosure state={popover} className={button()}>
        <Palette /> Color
      </PopoverDisclosure>
      <Popover
        state={popover}
        className={clsx(
          panel(),
          "w-64 scale-90 p-4 opacity-0 transition data-[enter]:scale-100 data-[enter]:opacity-100",
        )}
        portal
      >
        <PopoverArrow className="[&_path]:fill-black/50 [&_path]:stroke-black/50" />
        <div className="grid auto-rows-[3rem] grid-cols-3 gap-2">
          {Object.entries(characterColors).map(([name, classes]) => (
            <Button
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
      </Popover>
    </>
  )
}
