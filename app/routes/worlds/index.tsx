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
  return redirect(`/worlds/${world.id}`, 303)
}

export const meta = () => getAppMeta({ title: "Your Worlds" })

export default function WorldListPage() {
  const { worlds } = useLoaderData<typeof loader>()
  const transition = useTransition()

  return (
    <>
      <PageHeader
        title="Your Worlds"
        breadcrumbs={[{ title: "Home", href: "/" }]}
      />
      <main>
        <div className="mt-8 max-w-screen-xl w-full flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:[&>*]:basis-64 justify-start">
          {worlds.map((world) => (
            <WorldCard key={world.id} world={world} />
          ))}
        </div>
        <Form className="mt-4" method="post">
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
      <div className="flex flex-col h-full gap-3 p-4">
        <h2 className="text-3xl font-light leading-none">{props.world.name}</h2>
        <p className="opacity-75 leading-tight text-sm mt-auto">
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
