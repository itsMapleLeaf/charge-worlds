/* eslint-disable unicorn/prefer-top-level-await */
import { Form, useLoaderData, useNavigation } from "@remix-run/react"
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@vercel/remix"
import { route } from "routes-gen"
import { useSpinDelay } from "spin-delay"
import { AppHeader } from "~/modules/app/app-header"
import { getAppMeta } from "~/modules/app/meta"
import { button } from "~/modules/ui/button"
import { LoadingSpinner } from "~/modules/ui/loading"
import { type Settings, getSettings, updateSettingsFromForm } from "~/settings"

export const meta: V2_MetaFunction<typeof loader> = () =>
  getAppMeta({ title: "Settings" })

export async function loader({ request }: LoaderArgs) {
  const settings = await getSettings(request)
  return json({ settings })
}

export async function action({ request }: ActionArgs) {
  const settings = await getSettings(request)
  return redirect(route("/settings"), {
    headers: {
      "Set-Cookie": await updateSettingsFromForm(
        settings,
        await request.formData(),
      ),
    },
  })
}

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="grid gap-4">
      <AppHeader title="Settings" breadcrumbs={[]} />
      <div className="panel grid gap-4 p-4">
        <ToggleSetting
          id="fancyMode"
          name="Fancy Mode"
          description="Enables fancy UI effects, like background blur. Try turning this off if you have performance issues."
          value={data.settings.fancyMode}
        />
      </div>
    </div>
  )
}

function ToggleSetting(props: {
  id: keyof Settings
  name: string
  description: string
  value: boolean
}) {
  const navigation = useNavigation()
  const isPending = useSpinDelay(navigation.state !== "idle")
  return (
    <section>
      <h2 className="text-2xl font-light">{props.name}</h2>
      <p className="mb-2 text-sm opacity-75">{props.description}</p>
      <Form method="POST">
        <button
          className={button()}
          name="fancyMode"
          value={String(!props.value)}
        >
          {isPending && <LoadingSpinner size="small" />}
          {props.value ? "On" : "Off"}
        </button>
      </Form>
    </section>
  )
}
