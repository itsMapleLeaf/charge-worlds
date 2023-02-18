import { Tab, TabList, TabPanel, useTabState } from "ariakit"
import { Scroll } from "lucide-react"
import { z } from "zod"
import { DashboardModule } from "../dashboard/dashboard-module"
import { defineLiveblocksListCollection } from "../liveblocks/collection"
import { ClockInput } from "../ui/clock-input"
import { navLinkClass } from "../ui/styles"

const cardBlockSchema = z.union([
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    src: z.string(),
  }),
])

const cardSchema = z.object({
  id: z.string(),
  blocks: z.array(cardBlockSchema),
  hidden: z.boolean().default(true),
})

const LibraryCardCollection = defineLiveblocksListCollection(
  "libraryCards",
  cardSchema,
)

const SceneCardCollection = defineLiveblocksListCollection(
  "sceneCards",
  cardSchema,
)

export const sceneModule = new DashboardModule({
  name: "Scene",
  description:
    "View reference images, clocks, and other info related to the current scene. This is where the action happens.",
  icon: <Scroll />,

  component: SceneView,
})

function SceneView() {
  const tabState = useTabState()

  const tabs = [
    {
      id: "scene",
      tabLabel: "Current Scene",
      tabContent: <CurrentSceneView />,
    },
    {
      id: "library",
      tabLabel: "Library",
      tabContent: <LibraryView />,
    },
  ]

  return (
    <div className="min-h-full bg-slate-900">
      <TabList
        as="nav"
        state={tabState}
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 p-3"
      >
        {tabs.map((tab) => (
          <Tab
            as="button"
            key={tab.id}
            id={tab.id}
            className={navLinkClass({
              isActive: tabState.selectedId === tab.id,
            })}
          >
            {tab.tabLabel}
          </Tab>
        ))}
      </TabList>

      {tabs.map((tab) => (
        <TabPanel key={tab.id} state={tabState} id={tab.id}>
          {tab.tabContent}
        </TabPanel>
      ))}
    </div>
  )
}

function CurrentSceneView() {
  const cards = SceneCardCollection.useItems()
  return (
    <div className="grid grid-rows-1 gap-4 fluid-cols-64">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          key={index}
          className="col-end-[span_1] row-end-[span_1] bg-slate-800"
        >
          <header className="flex items-center gap-1 bg-slate-700 p-2">
            {/* <GripVertical className="h-5 w-5 opacity-75" /> */}
            <h3 className="flex-1 text-2xl font-light leading-tight">
              Card {index + 1}
            </h3>
            {/* <button className=" hover:opacity-100 can-hover:opacity-75">
              <Eye className="h-5 w-5" />
            </button> */}
          </header>

          <section className="relative aspect-square">
            {/* <GripVertical className="h-5 w-5 opacity-75" /> */}
            <img
              src="https://picsum.photos/seed/1/300/500"
              alt="Example"
              className="absolute aspect-square object-cover s-full"
            />
            <img
              src="https://picsum.photos/seed/1/300/500"
              alt="Example"
              className="absolute aspect-square object-contain drop-shadow-md backdrop-blur backdrop-brightness-50 s-full"
            />
          </section>

          {index % 2 === 0 && (
            <section className="flex items-center gap-1 p-2">
              {/* <GripVertical className="h-5 w-5 opacity-75" /> */}
              <p className="flex-1">Text block 1</p>
            </section>
          )}

          {index % 3 === 0 && (
            <section className="flex items-center gap-1 p-2">
              {/* <GripVertical className="h-5 w-5 opacity-75" /> */}
              <p className="flex-1">Text block 2</p>
            </section>
          )}

          {index % 4 === 0 && (
            <section className="flex items-center gap-1 p-2">
              {/* <GripVertical className="h-5 w-5 opacity-75" /> */}
              <ClockInput
                name="cloc"
                progress={3}
                maxProgress={8}
                onProgressChange={() => {}}
              />
            </section>
          )}
        </article>
      ))}
    </div>
  )
}

function LibraryView() {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex-grow rounded-lg bg-slate-800 p-3">
        <p>todo: cards</p>
      </div>
    </div>
  )
}
