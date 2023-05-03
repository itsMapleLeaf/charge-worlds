import { useActionData, useLoaderData } from "@remix-run/react"
import { withZod } from "@remix-validated-form/with-zod"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { CheckCircle } from "lucide-react"
import { ValidatedForm, validationError } from "remix-validated-form"
import { z } from "zod"
import { assert } from "~/helpers/assert"
import { db } from "~/modules/app/db.server"
import { requireWorldOwner } from "~/modules/auth/membership.server"
import { requireSessionUser } from "~/modules/auth/session.server"
import { FormButton } from "~/modules/forms/form-button"
import { FormInput } from "~/modules/forms/form-input"
import { getWorld } from "~/modules/world/world-db.server"

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

const validator = withZod(
  z.object({
    name: z.string().min(1).max(256),
  }),
)

export async function action({ request, params }: ActionArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  const result = await validator.validate(await request.formData())
  if (result.error) {
    return validationError(result.error)
  }

  try {
    await db.world.update({
      where: { id: world.id },
      data: result.data,
    })
  } catch (error) {
    console.error(error)
    return json({ error: "Failed to update world, try again?" }, 500)
  }

  return json({ ok: true })
}

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className="grid gap-4 p-4 panel">
      <h1 className="text-3xl font-light">World Details</h1>
      {actionData && "error" in actionData && (
        <p className="text-red-4">{actionData.error}</p>
      )}
      <ValidatedForm method="POST" validator={validator} className="contents">
        <FormInput
          name="name"
          label="Name"
          required
          defaultValue={data.world.name}
          placeholder="A Brand New World"
        />
        <FormButton className="justify-self-start button">
          <CheckCircle size={20} /> Save
        </FormButton>
      </ValidatedForm>
    </div>
  )
}
