import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import {
  Dialog,
  DialogDismiss,
  Tab,
  TabList,
  TabPanel,
  useDialogState,
  useTabState,
} from "ariakit"
import {
  Clock,
  Gamepad2,
  Image,
  List,
  SidebarClose,
  SidebarOpen,
  Users,
} from "lucide-react"
import { findSessionUser } from "~/auth.server"
import { PageHeader } from "~/ui/page-header"
import { buttonStyle } from "~/ui/styles"
import { loadWorldState, WorldStateProvider } from "~/world-state"

export async function loader({ request, params }: LoaderArgs) {
  const user = await findSessionUser(request)
  const world = await loadWorldState(params.worldId!, user)
  return { user, world }
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={data.world.name}
        user={data.user}
        breadcrumbs={[{ title: "Worlds", href: "/worlds" }]}
      />
      <div className="mt-8 mb-4">
        <WorldStateProvider value={data.world}>
          <Outlet />
        </WorldStateProvider>
      </div>
      <div className="sticky bottom-4 mt-auto md:bottom-8">
        <WorldMenuDialogButton />
      </div>
    </div>
  )
}

function WorldMenuDialogButton() {
  const dialog = useDialogState({ animated: true })
  return (
    <>
      <button
        title="Open World Menu"
        className={buttonStyle({ shape: "circle", size: 14 })}
        onClick={dialog.toggle}
      >
        <SidebarOpen className="s-6" />
      </button>
      <Dialog
        state={dialog}
        as="section"
        aria-label="World Menu Dialog"
        className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col gap-2 p-4 transition duration-200 data-[enter]:translate-x-0 data-[leave]:-translate-x-full data-[enter]:ease-out data-[leave]:ease-in md:p-8"
      >
        <div className="flex-1">
          <WorldMenu />
        </div>
        <footer>
          <DialogDismiss
            title="Close Dialog"
            state={dialog}
            className={buttonStyle({ shape: "circle", size: 14 })}
          >
            <SidebarClose className="s-6" />
          </DialogDismiss>
        </footer>
      </Dialog>
    </>
  )
}

function WorldMenu() {
  const tabState = useTabState()

  type TabInfo = {
    title: string
    tabContent: React.ReactNode
    panelContent: React.ReactNode
  }

  const tabs: TabInfo[] = [
    {
      title: "Characters",
      tabContent: <Users />,
      panelContent: "characters",
    },
    {
      title: "Clocks",
      tabContent: <Clock />,
      panelContent: "clocks",
    },
    {
      title: "Gallery",
      tabContent: <Image />,
      panelContent: "gallery",
    },
    {
      title: "Players",
      tabContent: <Gamepad2 />,
      panelContent: "players",
    },
    {
      title: "Character Fields",
      tabContent: <List />,
      panelContent: "character fields",
    },
  ]

  return (
    <section
      className="flex h-full overflow-clip rounded-lg bg-black/75 shadow-lg backdrop-blur"
      aria-label="World Menu"
    >
      <TabList state={tabState} as="nav" className="flex flex-col bg-black">
        {tabs.map((tab) => (
          <Tab
            key={tab.title}
            title={tab.title}
            id={tab.title}
            className={buttonStyle({ active: tab.title === tabState.activeId })}
          >
            {tab.tabContent}
          </Tab>
        ))}
      </TabList>
      <main className="min-h-0 flex-1 overflow-auto">
        {tabs.map((tab) => (
          <TabPanel
            as="section"
            key={tab.title}
            state={tabState}
            id={tab.title}
            className="p-3"
          >
            <h2 className="text-2xl font-light leading-tight">{tab.title}</h2>
            <p className="text-gray-400">{tab.panelContent}</p>
          </TabPanel>
        ))}
      </main>
    </section>
  )
}
