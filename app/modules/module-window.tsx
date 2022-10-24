import { Select, SelectItem, SelectPopover, useSelectState } from "ariakit"
import clsx from "clsx"
import cuid from "cuid"
import { ChevronDown, Maximize2, SeparatorVertical, X } from "lucide-react"
import { useContext } from "react"
import type { MosaicBranch } from "react-mosaic-component"
import {
  MosaicContext,
  MosaicWindow,
  MosaicWindowContext,
} from "react-mosaic-component"
import {
  activePressClass,
  clearButtonClass,
  menuItemClass,
  menuPanelClass,
} from "../ui/styles"

export function ModuleWindow({
  windowId: id,
  windowPath: path,
}: {
  windowId: string
  windowPath: MosaicBranch[]
}) {
  return (
    <MosaicWindow
      title={id}
      path={path}
      createNode={() => cuid()}
      renderToolbar={() => (
        <div className="flex items-center justify-between w-full px-3 gap-4">
          <ModuleViewSelect />
          <ModuleWindowControls windowPath={path} />
        </div>
      )}
    >
      <section className="w-full h-full bg-slate-800">
        <p>test</p>
      </section>
    </MosaicWindow>
  )
}

function ModuleViewSelect() {
  const options = ["Characters", "Clocks", "Dice", "Whiteboard"] as const

  const select = useSelectState({
    defaultValue: options[0],
    gutter: 12,
    animated: true,
  })

  return (
    <>
      <Select
        state={select}
        className={clsx(
          "hover:text-blue-300 p-2 -m-2 leading-none flex items-center gap-1 min-w-0 ",
          activePressClass,
        )}
      >
        <ChevronDown />
        <span className="text-lg font-medium flex-1 min-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {select.value}
        </span>
      </Select>
      <SelectPopover state={select} className={menuPanelClass}>
        {options.map((option) => (
          <SelectItem key={option} value={option} className={menuItemClass}>
            {option}
          </SelectItem>
        ))}
      </SelectPopover>
    </>
  )
}

function ModuleWindowControls({ windowPath }: { windowPath: MosaicBranch[] }) {
  const { mosaicActions } = useContext(MosaicContext)
  const { mosaicWindowActions } = useContext(MosaicWindowContext)
  return (
    <nav className="flex items-center gap-3">
      <button
        title="Split"
        className={clearButtonClass}
        onClick={() => mosaicWindowActions.split(windowPath)}
      >
        <SeparatorVertical size={20} />
      </button>
      <button
        title="Expand"
        className={clearButtonClass}
        onClick={() => mosaicActions.expand(windowPath, 75)}
      >
        <Maximize2 size={20} />
      </button>
      <button
        title="Close"
        className={clearButtonClass}
        onClick={() => mosaicActions.remove(windowPath)}
      >
        <X size={20} />
      </button>
    </nav>
  )
}
