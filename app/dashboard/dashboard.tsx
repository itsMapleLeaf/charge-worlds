import { Select, SelectItem, SelectPopover, useSelectState } from "ariakit"
import clsx from "clsx"
import cuid from "cuid"
import {
  ChevronDown,
  Maximize2,
  PlusSquare,
  SeparatorVertical,
  X,
} from "lucide-react"
import { createContext, useContext } from "react"
import type { MosaicBranch, MosaicNode } from "react-mosaic-component"
import {
  Mosaic,
  MosaicContext,
  MosaicWindow,
  MosaicWindowContext,
} from "react-mosaic-component"
import { z } from "zod"
import { useLocalStorage } from "../helpers/local-storage"
import {
  activePressClass,
  clearButtonClass,
  menuItemClass,
  menuPanelClass,
} from "../ui/styles"
import { dashboardModuleLibrary } from "./dashboard-module-library"
import { DashboardModuleView } from "./dashboard-module-view"

const mosaicNodeSchema: z.ZodType<MosaicNode<string>> = z.union([
  z.string(),
  z.object({
    direction: z.enum(["row", "column"]),
    first: z.lazy(() => mosaicNodeSchema),
    second: z.lazy(() => mosaicNodeSchema),
    splitPercentage: z.number().optional(),
  }),
])

const windowModulesSchema = z.record(z.object({ moduleId: z.string() }))

const defaultWindows: MosaicNode<string> = {
  direction: "row",
  first: "characters",
  second: {
    direction: "row",
    first: "clocks",
    second: "dice",
    splitPercentage: (1 / 2) * 100,
  },
  splitPercentage: (2 / 3) * 100,
}

const defaultWindowModules: z.infer<typeof windowModulesSchema> = {
  characters: { moduleId: "characters" },
  clocks: { moduleId: "clocks" },
  dice: { moduleId: "dice" },
}

function useDashboardProvider() {
  const [windowModules, setWindowModules] = useLocalStorage({
    key: "dashboardWindowModules",
    schema: windowModulesSchema,
    fallback: defaultWindowModules,
  })

  const [mosaic, setMosaic] = useLocalStorage<z.infer<
    typeof mosaicNodeSchema
  > | null>({
    key: "dashboardWindows",
    schema: mosaicNodeSchema.nullable(),
    fallback: defaultWindows,
  })

  const setWindowModule = (windowId: string, moduleId: string) => {
    setWindowModules({ ...windowModules, [windowId]: { moduleId } })
  }

  const addWindow = () => {
    if (!mosaic) {
      setMosaic(cuid())
    } else {
      setMosaic({
        direction: "row",
        first: mosaic,
        second: cuid(),
        splitPercentage: 50,
      })
    }
  }

  return {
    mosaic,
    setMosaic,
    addWindow,
    windowModules,
    setWindowModule,
  }
}

const DashboardContext = createContext<ReturnType<typeof useDashboardProvider>>(
  {
    mosaic: null,
    addWindow: () => {},
    setMosaic: () => {},
    windowModules: {},
    setWindowModule: () => {},
  },
)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  return (
    <DashboardContext.Provider value={useDashboardProvider()}>
      {children}
    </DashboardContext.Provider>
  )
}

export function DashboardNewWindowButton() {
  const { addWindow } = useContext(DashboardContext)
  return (
    <button className={clearButtonClass} onClick={addWindow}>
      <PlusSquare /> New window
    </button>
  )
}

export function DashboardMosaic() {
  const { mosaic, setMosaic } = useContext(DashboardContext)
  return (
    <Mosaic
      value={mosaic}
      onChange={setMosaic}
      className=""
      renderTile={(id, path) => (
        <MosaicWindow
          title=""
          path={path}
          createNode={() => cuid()}
          renderToolbar={() => (
            <div className="flex items-center justify-between w-full px-2 gap-4">
              <DashboardModuleSelect windowId={id} />
              <DashboardWindowControls windowPath={path} />
            </div>
          )}
        >
          <DashboardWindowContent windowId={id} />
        </MosaicWindow>
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
  )
}

function DashboardWindowContent({ windowId }: { windowId: string }) {
  const { windowModules } = useContext(DashboardContext)
  const moduleId =
    windowModules[windowId]?.moduleId ?? Object.keys(dashboardModuleLibrary)[0]
  const module = moduleId ? dashboardModuleLibrary[moduleId] : undefined

  return (
    <section className="thin-scrollbar w-full h-full bg-slate-800 overflow-y-auto">
      {module && moduleId ? (
        <DashboardModuleView moduleId={moduleId} module={module} />
      ) : (
        <p className="p-4 opacity-50 text-2xl font-light">
          Couldn&apos;t find that module 🤔
        </p>
      )}
    </section>
  )
}

function DashboardModuleSelect({ windowId }: { windowId: string }) {
  const { windowModules, setWindowModule } = useContext(DashboardContext)
  const moduleIds = Object.keys(dashboardModuleLibrary)

  const select = useSelectState({
    value: windowModules[windowId]?.moduleId ?? moduleIds[0],
    setValue: (value) => setWindowModule(windowId, value),
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
          {dashboardModuleLibrary[select.value]?.name}
        </span>
      </Select>
      <SelectPopover state={select} className={menuPanelClass}>
        {moduleIds.map((id) => {
          const module = dashboardModuleLibrary[id]
          return (
            <SelectItem key={id} value={id} className={menuItemClass}>
              <p>{module?.name ?? "⚠ unknown module"}</p>
              {module?.description && (
                <p className="text-sm opacity-70 mt-1">{module.description}</p>
              )}
            </SelectItem>
          )
        })}
      </SelectPopover>
    </>
  )
}

function DashboardWindowControls({
  windowPath,
}: {
  windowPath: MosaicBranch[]
}) {
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
