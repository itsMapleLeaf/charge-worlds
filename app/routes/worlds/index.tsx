import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import { Plus } from "lucide-react"
import { db } from "~/db.server"
import { plural } from "~/helpers/plural"
import { getAppMeta } from "~/meta"
import { PageHeader } from "~/ui/page-header"
import { RelativeTimestamp } from "~/ui/relative-timestamp"
import { buttonStyle, interactiveCardStyle } from "~/ui/styles"

export async function loader() {
  const worlds = await db.world.findMany({
    include: {
      memberships: {
        select: {
          id: true,
        },
      },
    },
  })

  return {
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
  const { worlds } = useLoaderData<typeof loader>()
  const transition = useTransition()

  return (
    <>
      <PageHeader title="Your Worlds" />
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
    <Link to={props.id} className={interactiveCardStyle()}>
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
