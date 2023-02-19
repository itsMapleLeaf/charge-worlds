import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { Params } from "@remix-run/react"
import { useActionData, useLoaderData, useTransition } from "@remix-run/react"
import { cx } from "class-variance-authority"
import { Minus, Plus } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { route } from "routes-gen"
import { zfd } from "zod-form-data"
import { assert } from "~/helpers/assert"
import { discordIdSchema } from "~/helpers/discord-id"
import { ActionRouter, useActionUi } from "~/helpers/form-action-router"
import { db } from "~/modules/app/db.server"
import { requireWorldOwner } from "~/modules/auth/membership.server"
import { requireSessionUser } from "~/modules/auth/session.server"
import { squareButton } from "~/modules/ui/button"
import { Field } from "~/modules/ui/field"
import { input } from "~/modules/ui/input"
import { panel } from "~/modules/ui/panel"
import { errorTextClass } from "~/modules/ui/styles"
import { getWorld } from "~/modules/world/world-db.server"

const thisRoute = (params: Params) =>
  route("/worlds/:worldId/players", params as any)

type ActionContext = {
  worldId: string
}

const router = new ActionRouter<ActionContext>()

const addPlayerAction = router.route("addPlayer", {
  input: zfd.formData({ discordId: zfd.text(discordIdSchema) }),
  callback: async ({ discordId }, { worldId }) => {
    const data = {
      role: "PLAYER",
      world: { connect: { id: worldId } },
      user: {
        connectOrCreate: {
          where: { discordId },
          create: { discordId, name: "Unknown" },
        },
      },
    } as const

    await db.membership.upsert({
      where: {
        worldId_userDiscordId: { worldId, userDiscordId: discordId },
      },
      update: data,
      create: data,
    })
  },
})

const removePlayerAction = router.route("removePlayer", {
  input: zfd.formData({ discordId: zfd.text(discordIdSchema) }),
  callback: async ({ discordId }, { worldId }) => {
    await db.membership.delete({
      where: {
        worldId_userDiscordId: { worldId, userDiscordId: discordId },
      },
    })
  },
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

  return json({
    players,
  })
}

export async function action(args: ActionArgs) {
  assert(args.params.worldId, "worldId is required")

  const [user, world] = await Promise.all([
    requireSessionUser(args.request),
    getWorld(args.params.worldId),
  ])
  await requireWorldOwner(user, world)

  return router.handle(
    args,
    { worldId: args.params.worldId },
    thisRoute(args.params),
  )
}

export default function PlayersPage() {
  const data = useLoaderData<typeof loader>()
  return (
    <section className={cx(panel(), "p-4 grid gap-4")}>
      <h2 className="text-3xl font-light">Players</h2>
      <div className="grid gap-2">
        <AddPlayerForm />
        {data.players.map((player) => (
          <RemovePlayerForm key={player.userDiscordId} player={player} />
        ))}
      </div>
    </section>
  )
}

function AddPlayerForm() {
  const fieldId = useId()
  const actionData = useActionData<typeof action>()
  const transition = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const addPlayer = useActionUi(addPlayerAction, actionData)

  useEffect(() => {
    if (transition.state === "idle" && !addPlayer.errors) {
      formRef.current!.reset()
    }
  }, [addPlayer.errors, transition.state])

  return (
    <addPlayer.Form ref={formRef}>
      <Field label="Discord user ID" errors={addPlayer.fieldErrors?.discordId}>
        <div className="flex gap-2">
          <addPlayer.Input
            name="discordId"
            id={fieldId}
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
    </addPlayer.Form>
  )
}

function RemovePlayerForm({
  player,
}: {
  player: { userDiscordId: string; user: { name: string } }
}) {
  const actionData = useActionData<typeof action>()
  const removePlayer = useActionUi(removePlayerAction, actionData)
  return (
    <removePlayer.Form>
      <removePlayer.HiddenInput name="discordId" value={player.userDiscordId} />
      <div className="flex items-start gap-2">
        <p
          className={cx(
            panel({ shadow: "none" }),
            "flex-1 px-3 flex items-center flex-wrap gap-x-1 min-h-[3rem]",
          )}
        >
          <span>{player.user.name}</span>
          <span className="block opacity-75">({player.userDiscordId})</span>
        </p>
        <button
          className={squareButton({ shadow: "none" })}
          type="submit"
          title="Remove player"
        >
          <Minus />
        </button>
      </div>
      {removePlayer.errors?.map((error, index) => (
        <p key={index} className={errorTextClass}>
          {error}
        </p>
      ))}
    </removePlayer.Form>
  )
}
