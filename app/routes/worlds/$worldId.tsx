import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { findSessionUser } from "~/auth.server"
import { PageHeader } from "~/ui/page-header"
import { loadWorldState, WorldStateProvider } from "~/world-state"

export async function loader({ request, params }: LoaderArgs) {
  const user = await findSessionUser(request)
  const world = await loadWorldState(params.worldId!, user)
  return { user, world }
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <PageHeader
        title={data.world.name}
        user={data.user}
        breadcrumbs={[{ title: "Worlds", href: "/worlds" }]}
      />
      <div className="mt-8">
        <WorldStateProvider value={data.world}>
          <Outlet />
        </WorldStateProvider>
      </div>
    </>
  )
}
