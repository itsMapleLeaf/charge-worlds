import { json, type ActionArgs, type SerializeFrom } from "@remix-run/node"
import { useFetcher } from "@remix-run/react"
import { cx } from "class-variance-authority"
import { Plus } from "lucide-react"
import { useEffect, useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { assert } from "~/helpers/assert"
import { discordIdSchema } from "~/helpers/discord-id"
import { db } from "~/modules/app/db.server"
import { requireWorldOwner } from "~/modules/auth/membership.server"
import { requireSessionUser } from "~/modules/auth/session.server"
import { squareButton } from "~/modules/ui/button"
import { Field } from "~/modules/ui/field"
import { input } from "~/modules/ui/input"
import { errorTextClass } from "~/modules/ui/styles"
import { WorldContext } from "~/modules/world/world-context"
import { getWorld } from "~/modules/world/world-db.server"

export async function action({ request, params }: ActionArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

  const schema = z.object({
    discordId: discordIdSchema,
  })

  const result = schema.safeParse(Object.fromEntries(await request.formData()))
  if (!result.success) {
    return json({ errors: result.error.formErrors }, 400)
  }

  const data = {
    role: "PLAYER",
    world: { connect: { id: params.worldId } },
    user: {
      connectOrCreate: {
        where: { discordId: result.data.discordId },
        create: { discordId: result.data.discordId, name: "Unknown" },
      },
    },
  } as const

  await db.membership.upsert({
    where: {
      worldId_userDiscordId: {
        worldId: params.worldId,
        userDiscordId: result.data.discordId,
      },
    },
    update: data,
    create: data,
  })

  return json({ errors: null })
}

export function AddPlayerForm() {
  const fetcher = useFetcher<SerializeFrom<typeof action>>()
  const formRef = useRef<HTMLFormElement>(null)
  const { world } = WorldContext.useValue()

  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data?.errors) {
      formRef.current!.reset()
    }
  }, [fetcher.data?.errors, fetcher.state])

  return (
    <fetcher.Form
      method="post"
      action={route("/worlds/:worldId/players/add", { worldId: world.id })}
      ref={formRef}
    >
      {fetcher.data?.errors?.formErrors.map((error, index) => (
        <p key={index} className={errorTextClass}>
          {error}
        </p>
      ))}
      <Field
        label="Discord user ID"
        errors={fetcher.data?.errors?.fieldErrors.discordId}
      >
        <div className="flex gap-2">
          <input
            name="discordId"
            className={cx(input(), "flex-1")}
            placeholder="123456789012345678"
            pattern="[0-9]+"
            title="A valid discord ID (digits only)"
          />
          <button
            className={squareButton({ shadow: "none" })}
            type="submit"
            title="Add player"
          >
            <Plus />
          </button>
        </div>
      </Field>
    </fetcher.Form>
  )
}
