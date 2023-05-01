import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@vercel/remix"
import { json, redirect } from "@vercel/remix"
import clsx from "clsx"
import { Wand2 } from "lucide-react"
import { route } from "routes-gen"
import { raise } from "~/helpers/errors"
import { unauthorized } from "~/helpers/responses"
import { AppHeader } from "~/modules/app/app-header"
import { getAppMeta } from "~/modules/app/meta"
import { getSessionUser } from "~/modules/auth/session.server"
import { RelativeTimestamp } from "~/modules/dom/relative-timestamp"
import { button } from "~/modules/ui/button"
import { linkClass } from "~/modules/ui/link"
import { LoadingSpinner } from "~/modules/ui/loading"
import { interactivePanel } from "~/modules/ui/panel"
import { db } from "../modules/app/db.server"

export const meta: V2_MetaFunction<typeof loader> = () =>
  getAppMeta({ title: "Your Worlds" })

export async function loader({ request }: LoaderArgs) {
  const user = await getSessionUser(request)
  if (!user) {
    return json({ worlds: null })
  }

  const worlds = await db.world.findMany({
    where: {
      memberships: {
        some: {
          userDiscordId: user.discordId,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      memberships: {
        select: { id: true },
      },
    },
  })

  return json({
    worlds: worlds.map((world) => ({
      ...world,
      createdAt: world.createdAt.toISOString(),
      playerCount: world.memberships.length,
    })),
  })
}

export async function action({ request }: ActionArgs) {
  const user = (await getSessionUser(request)) ?? raise(unauthorized())

  const world = await db.world.create({
    data: {
      name: "New World",
      memberships: {
        create: {
          userDiscordId: user.discordId,
          role: "OWNER",
        },
      },
    },
    select: { id: true },
  })

  return redirect(route("/worlds/:worldId", { worldId: world.id }))
}

export default function WorldListPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="grid gap-4">
      <AppHeader title="Your Worlds" breadcrumbs={[]} />
      {data.worlds ? (
        <>
          <WorldList worlds={data.worlds} />
          <CreateWorldButton />
        </>
      ) : (
        <WorldListCta />
      )}
    </div>
  )
}

function CreateWorldButton() {
  const transition = useTransition()

  const pending =
    (transition.type === "actionSubmission" ||
      transition.type === "actionRedirect") &&
    transition.submission.method === "POST"

  return (
    <Form method="POST">
      <button className={button()}>
        {pending ? <LoadingSpinner size="small" /> : <Wand2 />}
        Create a new world
      </button>
    </Form>
  )
}

function WorldListCta() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <p className="text-gray-500">
        Please{" "}
        <a href="/auth/discord/login" className={linkClass}>
          sign in with Discord
        </a>{" "}
        to continue
      </p>
    </div>
  )
}

function WorldList({
  worlds,
}: {
  worlds: Array<{
    id: string
    name: string
    createdAt: string
    playerCount: number
  }>
}) {
  return (
    <section className="grid gap-4 fluid-cols-56">
      {worlds.map((world) => (
        <Link
          key={world.id}
          to={route("/worlds/:worldId", { worldId: world.id })}
          className={clsx(interactivePanel(), "flex flex-col p-4")}
        >
          <h2 className="mb-2 text-2xl font-light">{world.name}</h2>
          <p className="mt-auto text-sm opacity-75">
            {world.playerCount} {world.playerCount === 1 ? "player" : "players"}
          </p>
          <p className="text-sm opacity-75">
            Created <RelativeTimestamp date={world.createdAt} addSuffix />
          </p>
        </Link>
      ))}
    </section>
  )
}
