import { redirect, type LoaderArgs } from "@remix-run/node"
import {
  Form,
  Link,
  useLoaderData,
  useTransition,
  type CatchBoundaryComponent
} from "@remix-run/react"
import { Plus } from "lucide-react"
import { findSessionUser } from "~/auth.server"
import { db } from "~/db.server"
import { plural } from "~/helpers/plural"
import { getAppMeta } from "~/meta"
import { CatchBoundaryMessage } from "~/ui/catch-boundary-message"
import { PageHeader } from "~/ui/page-header"
import { RelativeTimestamp } from "~/ui/relative-timestamp"
import { buttonStyle, interactiveCardStyle } from "~/ui/styles"

export async function loader({ request }: LoaderArgs) {
  const user = await findSessionUser(request)
  if (!user) {
    throw new Response(undefined, { status: 401 })
  }

  const worlds = await db.world.findMany({
    where: {
      memberships: {
        some: {
          userDiscordId: user.discordId,
        },
      },
    },
    include: {
      memberships: {
        select: { id: true },
      },
    },
  })

  return {
    user: user && { ...user, avatarUrl: user.avatarUrl ?? undefined },
    worlds: worlds.map((world) => ({
      ...world,
      createdAt: world.createdAt.valueOf(),
    })),
  }
}

export async function action() {
  const world = await db.world.create({
    data: { name: "New World" },
  })
  return redirect(world.id, 303)
}

export const meta = () => getAppMeta({ title: "Your Worlds" })

export default function WorldListPage() {
  const { user, worlds } = useLoaderData<typeof loader>()
  const transition = useTransition()

  return (
    <>
      <PageHeader title="Your Worlds" user={user} />
      <main>
        <div className="mt-8 flex w-full max-w-screen-xl flex-col justify-start gap-4 sm:flex-row sm:flex-wrap sm:[&>*]:basis-64">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              {...world}
              playerCount={world.memberships.length}
            />
          ))}
        </div>
        <Form method="post" className="mt-4">
          <button
            className={buttonStyle()}
            disabled={transition.state !== "idle"}
          >
            <Plus className="s-6" />
            New world
          </button>
        </Form>
      </main>
    </>
  )
}

function WorldCard(props: {
  id: string
  name: string
  createdAt: number
  playerCount: number
}) {
  return (
    <Link to={`worlds/${props.id}`} className={interactiveCardStyle()}>
      <div className="flex h-full flex-col gap-3 p-4">
        <h2 className="text-3xl font-light leading-none">{props.name}</h2>
        <p className="mt-auto text-sm leading-tight opacity-75">
          {plural(props.playerCount, "Player")}
          <br />
          Created{" "}
          <RelativeTimestamp date={new Date(props.createdAt)} addSuffix />
        </p>
      </div>
    </Link>
  )
}

export const CatchBoundary: CatchBoundaryComponent = () => {
  return (
    <>
      <PageHeader title="Your Worlds" user={undefined} />
      <CatchBoundaryMessage />
    </>
  )
}
