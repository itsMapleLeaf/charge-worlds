import { Select, SelectItem, SelectPopover, useSelectState } from "ariakit"
import clsx from "clsx"
import cuid from "cuid"
import { ChevronDown, Maximize2, SeparatorVertical, X } from "lucide-react"
import { createContext, useContext } from "react"
import type { MosaicBranch, MosaicNode } from "react-mosaic-component"
import {
  Corner,
  getNodeAtPath,
  getPathToCorner,
  Mosaic,
  MosaicContext,
  MosaicWindow,
  MosaicWindowContext,
  updateTree,
} from "react-mosaic-component"
import { z } from "zod"
import { isObject } from "../../helpers/is-object"
import { useLocalStorage } from "../../helpers/local-storage"
import {
  activePressClass,
  clearButtonClass,
  menuItemClass,
  menuPanelClass,
} from "../ui/styles"
import type { DashboardModule } from "./dashboard-module"
import { dashboardModules } from "./dashboard-modules"

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

  const addWindow = (moduleId: string) => {
    const windowId = cuid()
    setWindowModule(windowId, moduleId)
    if (!mosaic) {
      setMosaic(windowId)
    } else {
      const path = getPathToCorner(mosaic, Corner.TOP_LEFT)
      const parent = getNodeAtPath(mosaic, path.slice(0, -1))
      setMosaic(
        updateTree(mosaic, [
          {
            path,
            spec: (node) => ({
              direction:
                isObject(parent) && parent.direction === "row"
                  ? "column"
                  : "row",
              first: windowId,
              second: node,
              splitPercentage: (1 / 2) * 100,
            }),
          },
        ]),
      )
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

export function DashboardWindowButtons(props: {
  renderLabel: (label: string) => React.ReactNode
}) {
  const { addWindow } = useContext(DashboardContext)
  return (
    <div className="grid gap-4">
      {Object.entries(dashboardModules).map(([moduleId, module]) => (
        <button
          key={moduleId}
          className={clearButtonClass}
          onClick={() => addWindow(moduleId)}
          title={module.config.name}
        >
          <span className="pointer-events-none">{module.config.icon}</span>
          {props.renderLabel(module.config.name)}
        </button>
      ))}
    </div>
  )
}

export function DashboardMosaic() {
  const { mosaic, setMosaic } = useContext(DashboardContext)
  return (
    <Mosaic
      value={mosaic}
      onChange={setMosaic}
      className="isolate"
      renderTile={(id, path) => (
        <MosaicWindow
          title=""
          path={path}
          createNode={() => cuid()}
          renderToolbar={() => (
            <div className="flex w-full items-center justify-between gap-4 px-2">
              <DashboardModuleSelect windowId={id} />
              <DashboardWindowControls windowPath={path} />
            </div>
          )}
        >
          <DashboardWindowContent windowId={id} />
        </MosaicWindow>
      )}
      zeroStateView={
        <p className="absolute right-0 bottom-0 select-none p-8 text-4xl opacity-25">
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
  const modules = dashboardModules as Record<string, DashboardModule>
  const moduleId = windowModules[windowId]?.moduleId ?? Object.keys(modules)[0]
  const module = moduleId ? modules[moduleId] : undefined

  return (
    <section className="thin-scrollbar h-full w-full overflow-y-auto bg-slate-800">
      {module && moduleId ? (
        <module.config.component />
      ) : (
        <p className="p-4 text-2xl font-light opacity-50">
          Couldn&apos;t find that module 🤔
        </p>
      )}
    </section>
  )
}

function DashboardModuleSelect({ windowId }: { windowId: string }) {
  const { windowModules, setWindowModule } = useContext(DashboardContext)
  const modules = dashboardModules as Record<string, DashboardModule>
  const moduleIds = Object.keys(modules)

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
          "-m-2 flex min-w-0 items-center gap-1 p-2 leading-none hover:text-blue-300 ",
          activePressClass,
        )}
      >
        <ChevronDown />
        <span className="min-w-0 flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium">
          {modules[select.value]?.config.name}
        </span>
      </Select>
      <SelectPopover state={select} className={menuPanelClass}>
        {moduleIds.map((id) => (
          <SelectItem key={id} value={id} className={menuItemClass}>
            <p>{modules[id]?.config.name ?? "⚠ unknown module"}</p>
            {modules[id]?.config.description && (
              <p className="mt-1 text-sm opacity-70">
                {modules[id]?.config.description}
              </p>
            )}
          </SelectItem>
        ))}
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
