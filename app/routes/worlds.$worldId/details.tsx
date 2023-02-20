import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { cx } from "class-variance-authority"
import { CheckCircle } from "lucide-react"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { button } from "~/modules/ui/button"
import { input } from "~/modules/ui/input"
import { panel } from "~/modules/ui/panel"
import { assert } from "../../helpers/assert"
import { db } from "../../modules/app/db.server"
import { requireWorldOwner } from "../../modules/auth/membership.server"
import { requireSessionUser } from "../../modules/auth/session.server"
import { Field } from "../../modules/ui/field"
import { errorTextClass } from "../../modules/ui/styles"
import { getWorld } from "../../modules/world/world-db.server"

export async function loader({ request, params }: LoaderArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  return json({
    world: { name: world.name },
  })
}

export async function action({ request, params }: ActionArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  const result = zfd
    .formData({
      name: zfd.text(z.string().min(1).max(256)),
    })
    .safeParse(await request.formData())

  if (!result.success) {
    return json(result.error.formErrors, { status: 400 })
  }

  try {
    await db.world.update({
      where: { id: world.id },
      data: result.data,
    })
  } catch (error) {
    console.error(error)
    return json(
      { formErrors: ["Something went wrong. Try again?"], fieldErrors: null },
      { status: 500 },
    )
  }

  return json(null)
}

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className={cx(panel(), "p-4 grid gap-4")}>
      <h1 className="text-3xl font-light">World Details</h1>

      <Form method="post" className="contents">
        <Field label="Name" errors={actionData?.fieldErrors?.name}>
          <input
            name="name"
            required
            defaultValue={data.world.name}
            placeholder="A Brand New World"
            className={input()}
          />
        </Field>

        <div>
          <button type="submit" className={button()}>
            <CheckCircle size={20} /> Save
          </button>
        </div>
      </Form>

      {actionData?.formErrors?.map((error, index) => (
        <p key={index} className={errorTextClass}>
          {error}
        </p>
      ))}
    </div>
  )
}
