import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { Minus, Plus } from "lucide-react"
import { useId } from "react"
import { route } from "routes-gen"
import type { ZodError } from "zod"
import { z } from "zod"
import { getMembership } from "../auth/membership"
import { getSessionUser } from "../auth/session"
import { db } from "../core/db.server"
import { assert } from "../helpers/assert"
import { defineField } from "../helpers/form"
import {
  inputClass,
  labelTextClass,
  maxWidthContainerClass,
  solidButtonClass,
} from "../ui/styles"
import { getDefaultWorld } from "../world/world-db.server"

const snowflakeSchema = z
  .string()
  .regex(/^\d+$/, "Value must be a valid snowflake (discord ID)")

function formatZodError(error: ZodError) {
  return error.issues.map((i) => i.message).join("\n")
}

const userDiscordIdField = defineField("userDiscordId", snowflakeSchema)

export async function loader({ request, params }: LoaderArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    getSessionUser(request),
    getDefaultWorld(),
  ])
  if (!user) {
    return redirect(
      route(`/worlds/:worldId/dashboard`, { worldId: params.worldId }),
    )
  }

  const membership = await getMembership(user, world)
  if (membership?.role !== "OWNER") {
    return redirect(
      route(`/worlds/:worldId/dashboard`, { worldId: params.worldId }),
    )
  }

  const players = await db.membership.findMany({
    where: {
      AND: {
        worldId: world.id,
        role: "PLAYER",
      },
    },
    select: {
      user: {
        select: { name: true },
      },
      userDiscordId: true,
    },
  })

  return json({ players })
}

export async function action({ request }: ActionArgs) {
  const method = request.method.toLowerCase()

  if (method === "post") {
    const form = await request.formData()

    const userDiscordId = userDiscordIdField.safeParse(form)
    if (!userDiscordId.success) {
      return json(
        { success: false, error: formatZodError(userDiscordId.error) },
        { status: 400 },
      )
    }

    const world = await getDefaultWorld()

    await db.membership.create({
      data: {
        user: {
          connectOrCreate: {
            where: { discordId: userDiscordId.data },
            create: { discordId: userDiscordId.data, name: "Unknown" },
          },
        },
        world: { connect: { id: world.id } },
        role: "PLAYER",
      },
    })

    return json({ success: true, error: "" })
  }

  if (method === "delete") {
    const form = await request.formData()

    const userDiscordId = userDiscordIdField.safeParse(form)
    if (!userDiscordId.success) {
      return json(
        { success: false, error: formatZodError(userDiscordId.error) },
        { status: 400 },
      )
    }

    const world = await getDefaultWorld()

    await db.membership.delete({
      where: {
        worldId_userDiscordId: {
          userDiscordId: userDiscordId.data,
          worldId: world.id,
        },
      },
    })

    return json({ success: true, error: "" })
  }

  return json({ success: false, error: "Invalid method" }, { status: 405 })
}

export default function SettingsPage() {
  const { players } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const inputId = useId()
  return (
    <div className={maxWidthContainerClass}>
      <section className="px-4 py-8">
        <h2 className="text-3xl font-light">Add players</h2>

        {actionData?.error && (
          <p className="text-red-400">{actionData.error}</p>
        )}

        <div className="mt-4 grid grid-cols-[1fr,auto] gap-2">
          <Form method="post" className="contents" replace>
            <div className="col-span-2 -mb-1">
              <label className={labelTextClass} htmlFor={inputId}>
                Discord user ID
              </label>
            </div>
            <userDiscordIdField.input
              id={inputId}
              className={inputClass}
              placeholder="0123456789"
              required
            />
            <button title="Add player" className={solidButtonClass}>
              <Plus />
            </button>
          </Form>

          {players.map((player) => (
            <Form
              key={player.userDiscordId}
              method="delete"
              className="contents"
              replace
            >
              <p className={inputClass}>
                <span>{player.user.name}</span>
                <span className="ml-1 opacity-75 block">
                  ({player.userDiscordId})
                </span>
              </p>
              <userDiscordIdField.input
                type="hidden"
                value={player.userDiscordId}
              />
              <button
                title={`Remove ${player.user.name}`}
                className={solidButtonClass}
              >
                <Minus />
              </button>
            </Form>
          ))}
        </div>
      </section>
    </div>
  )
}
