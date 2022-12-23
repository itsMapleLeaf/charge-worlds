import { redirect } from "@remix-run/node"
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react"
import { formatDistanceToNow, subMonths } from "date-fns"
import { Plus } from "lucide-react"
import { getAppMeta } from "~/meta"
import { PageHeader } from "~/ui/page-header"
import { buttonStyle, interactiveCardStyle } from "~/ui/styles"
import { createWorld, getWorlds } from "~/worlds/data"

export async function loader() {
  return {
    worlds: await getWorlds(),
  }
}

export async function action() {
  const world = await createWorld()
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
            <WorldCard key={world.id} world={world} />
          ))}
        </div>
        <Form method="post" className="mt-4">
          <button
            className={buttonStyle()}
            disabled={transition.state !== "idle"}
          >
            <Plus class="s-6" />
            New world
          </button>
        </Form>
      </main>
    </>
  )
}

function WorldCard(props: { world: { id: string; name: string } }) {
  return (
    <Link to={props.world.id} className={interactiveCardStyle()}>
      <div className="flex h-full flex-col gap-3 p-4">
        <h2 className="text-3xl font-light leading-none">{props.world.name}</h2>
        <p className="mt-auto text-sm leading-tight opacity-75">
          {Math.floor(Math.random() * 8) + 2} Players
          <br />
          Created{" "}
          {formatDistanceToNow(
            subMonths(Date.now(), Math.floor(Math.random() * 24)),
            { addSuffix: true },
          )}
        </p>
      </div>
    </Link>
  )
}
