import { Maximize2, PlusSquare, X, Zap } from "lucide-react"
import { useContext } from "react"
import type { MosaicBranch } from "react-mosaic-component"
import { Mosaic, MosaicContext, MosaicWindow } from "react-mosaic-component"
import { clearButtonClass } from "../ui/styles"

export default function Home() {
  return (
    <div className="fixed inset-0 grid grid-rows-[auto,1fr]">
      <header className="bg-slate-800 flex py-4 px-6 gap-x-4 gap-y-2 flex-wrap items-center justify-between">
        <div className="flex items-center gap-2 -ml-2">
          <Zap />
          <h1 className="text-3xl font-light">Charge Worlds</h1>
        </div>
        <nav className="flex items-center">
          <button className={clearButtonClass}>
            <PlusSquare className="h-6" /> New window
          </button>
        </nav>
      </header>
      <main className="bg-slate-900 relative">
        <Mosaic<string>
          className=""
          renderTile={(id, path) => (
            <MosaicWindow
              title={id}
              path={path}
              toolbarControls={<MosaicWindowControls windowPath={path} />}
            >
              <div className="w-full h-full bg-slate-800">
                <p>test</p>
              </div>
            </MosaicWindow>
          )}
          initialValue={{
            direction: "row",
            first: "first",
            second: {
              direction: "column",
              first: "second",
              second: "third",
              splitPercentage: 50,
            },
            splitPercentage: 50,
          }}
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

function MosaicWindowControls({ windowPath }: { windowPath: MosaicBranch[] }) {
  const { mosaicActions } = useContext(MosaicContext)
  return (
    <div className="flex items-center px-3 gap-3">
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
    </div>
  )
}
