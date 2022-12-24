import type { LoaderArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { findSessionUser } from "~/auth.server"
import { db } from "~/db.server"
import { notFound } from "~/helpers/responses"
import { PageHeader } from "~/ui/page-header"

export async function loader({ request, params }: LoaderArgs) {
  const [user, world] = await Promise.all([
    findSessionUser(request),
    db.world
      .findUnique({ where: { id: params.worldId } })
      .then((world) => world ?? Promise.reject(notFound())),
  ])
  return { user, world }
}

export default function WorldPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <>
      <PageHeader
        title={data.world.name}
        user={data.user}
        breadcrumbs={[
          {
            title: "Worlds",
            href: "/worlds",
          },
        ]}
      />
      <div className="mt-8">
        <Outlet />
      </div>
    </>
  )
}
