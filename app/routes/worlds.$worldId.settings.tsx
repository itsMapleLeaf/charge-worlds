import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { Params } from "@remix-run/react"
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react"
import { Minus, Plus, Save } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { requireWorldOwner } from "../auth/membership"
import { requireSessionUser } from "../auth/session"
import { db } from "../core/db.server"
import { assert } from "../helpers/assert"
import { discordIdSchema } from "../helpers/discord-id"
import { defineFormAction, defineFormActionGroup } from "../helpers/form"
import { Field } from "../ui/field"
import {
  errorTextClass,
  inputClass,
  maxWidthContainerClass,
  solidButtonClass,
} from "../ui/styles"
import { getWorld } from "../world/world-db.server"

const thisRoute = (params: Params) =>
  route("/worlds/:worldId/settings", params as any)

const updateWorld = defineFormAction({
  fields: {
    name: z.string().max(256),
  },
  async action(values, { params }) {
    await db.world.update({
      where: { id: params.worldId! },
      data: {
        name: values.name,
      },
    })
  },
})

const addPlayer = defineFormAction({
  fields: {
    discordUserId: discordIdSchema,
  },
  async action(values, { params }) {
    const data = {
      role: "PLAYER",
      world: { connect: { id: params.worldId! } },
      user: {
        connectOrCreate: {
          where: { discordId: values.discordUserId },
          create: { discordId: values.discordUserId, name: "Unknown" },
        },
      },
    } as const

    await db.membership.upsert({
      where: {
        worldId_userDiscordId: {
          worldId: params.worldId!,
          userDiscordId: values.discordUserId,
        },
      },
      update: data,
      create: data,
    })
  },
})

const removePlayer = defineFormAction({
  fields: {
    discordUserId: discordIdSchema,
  },
  async action(values, { params }) {
    await db.membership.delete({
      where: {
        worldId_userDiscordId: {
          worldId: params.worldId!,
          userDiscordId: values.discordUserId,
        },
      },
    })
  },
})

const actionGroup = defineFormActionGroup({
  updateWorld,
  addPlayer,
  removePlayer,
})

export async function loader({ request, params }: LoaderArgs) {
  assert(params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(request),
    getWorld(params.worldId),
  ])
  await requireWorldOwner(user, world)

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

  return json({ players, world: { name: world.name } })
}

export async function action(args: ActionArgs) {
  assert(args.params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(args.request),
    getWorld(args.params.worldId),
  ])
  await requireWorldOwner(user, world)

  return actionGroup.handleSubmit(args, thisRoute(args.params))
}

export default function SettingsPage() {
  const { players, world } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className={maxWidthContainerClass}>
      <div className="py-4 grid gap-4">
        <section className="bg-slate-800 p-4 rounded-md shadow-md">
          <h2 className="text-3xl font-light mb-4">Overview</h2>
          <Form method="post" className="grid gap-4">
            <input {...actionGroup.types.updateWorld} />
            <Field
              label="World name"
              errors={actionData?.updateWorld?.fieldErrors?.name}
            >
              <input
                {...updateWorld.fields.name.input}
                defaultValue={world.name}
                className={inputClass}
                placeholder="My Awesome World"
              />
            </Field>
            <div>
              <button className={solidButtonClass} type="submit">
                <Save /> Save
              </button>
            </div>
            {actionData?.updateWorld?.globalError && (
              <p className={errorTextClass}>
                {actionData?.updateWorld?.globalError}
              </p>
            )}
          </Form>
        </section>

        <section className="bg-slate-800 p-4 rounded-md shadow-md">
          <h2 className="text-3xl font-light">Players</h2>
          <div className="mt-4 grid gap-2">
            <AddPlayerForm />
            {players.map((player) => (
              <RemovePlayerForm key={player.userDiscordId} player={player} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function AddPlayerForm() {
  const fieldId = useId()
  const actionData = useActionData<typeof action>()
  const transition = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (transition.state === "idle" && !actionData?.addPlayer.hasErrors) {
      formRef.current!.reset()
    }
  }, [actionData?.addPlayer.hasErrors, transition.state])

  return (
    <Form method="post" ref={formRef}>
      <input {...actionGroup.types.addPlayer} />
      <Field
        label="Discord user ID"
        errors={actionData?.addPlayer?.fieldErrors?.discordUserId?.concat(
          actionData?.addPlayer?.globalError || [],
        )}
      >
        <div className="flex gap-2">
          <input
            {...addPlayer.fields.discordUserId.input}
            id={fieldId}
            className={inputClass}
            placeholder="123456789012345678"
            pattern="[0-9]+"
            title="A valid discord ID (digits only)"
          />
          <button className={solidButtonClass} type="submit" title="Add player">
            <Plus />
          </button>
        </div>
      </Field>
    </Form>
  )
}

function RemovePlayerForm({
  player,
}: {
  player: { userDiscordId: string; user: { name: string } }
}) {
  const actionData = useActionData<typeof action>()
  return (
    <Form method="post">
      <input {...actionGroup.types.removePlayer} />
      <input
        {...removePlayer.fields.discordUserId.hidden(player.userDiscordId)}
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <p className={inputClass}>
            <span>{player.user.name}</span>
            <span className="ml-1 opacity-75 block">
              ({player.userDiscordId})
            </span>
          </p>
        </div>
        <button
          className={solidButtonClass}
          type="submit"
          title="Remove player"
        >
          <Minus />
        </button>
      </div>
      {actionData?.removePlayer?.globalError && (
        <p className={errorTextClass}>
          {actionData?.removePlayer?.globalError}
        </p>
      )}
    </Form>
  )
}
