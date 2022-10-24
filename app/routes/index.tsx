import { Select, SelectItem, SelectPopover, useSelectState } from "ariakit"
import cuid from "cuid"
import { Maximize2, PlusSquare, SeparatorVertical, X, Zap } from "lucide-react"
import { useContext, useState } from "react"
import type { MosaicBranch, MosaicNode } from "react-mosaic-component"
import {
  Mosaic,
  MosaicContext,
  MosaicWindow,
  MosaicWindowContext,
} from "react-mosaic-component"
import { clearButtonClass } from "../ui/styles"

export default function IndexPage() {
  const [mosaic, setMosaic] = useState<MosaicNode<string> | null>(() => cuid())

  const addWindow = () => {
    setMosaic((prev) => {
      if (!prev) return cuid()
      return {
        direction: "row",
        first: cuid(),
        second: prev,
        splitPercentage: 50,
      }
    })
  }

  return (
    <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
      <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center justify-between">
        <div className="flex items-center gap-2 -ml-2">
          <Zap />
          <h1 className="text-3xl font-light">Charge Worlds</h1>
        </div>
        <nav className="flex items-center">
          <button className={clearButtonClass} onClick={addWindow}>
            <PlusSquare className="h-6" /> New window
          </button>
        </nav>
      </header>
      <main className="bg-slate-900 relative">
        <Mosaic<string>
          value={mosaic}
          onChange={setMosaic}
          className=""
          renderTile={(id, path) => (
            <ModuleWindow windowId={id} windowPath={path} />
          )}
          zeroStateView={
            <p className="absolute right-0 bottom-0 p-8 text-4xl opacity-25 select-none">
              <a
                href="https://soundcloud.com/dylantallchief/san-holo-plant"
                target="_blank"
                rel="noopener noreferrer"
              >
                🪴
              </a>
            </p>
          }
        />
      </main>
    </div>
  )
}

function ModuleWindow({
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
        <div className="flex items-center justify-between w-full px-3">
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
    <div className="relative flex">
      <Select
        state={select}
        className="flex items-center gap-1 flex-row-reverse text-lg font-medium hover:text-blue-300 p-2 -m-2 leading-none"
      />
      <SelectPopover
        state={select}
        className="bg-slate-700 flex flex-col rounded-md shadow-md overflow-clip min-w-[10rem] transition origin-top-left data-[enter]:scale-100 data-[enter]:opacity-100 data-[leave]:opacity-0 data-[leave]:scale-95"
      >
        {options.map((option) => (
          <SelectItem
            key={option}
            value={option}
            className="leading-none p-3 data-[active-item]:bg-black/25 cursor-pointer"
          >
            {option}
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
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
