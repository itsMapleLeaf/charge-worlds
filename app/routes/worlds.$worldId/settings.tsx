import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { Params } from "@remix-run/react"
import { useActionData, useLoaderData, useTransition } from "@remix-run/react"
import clsx from "clsx"
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ListPlus,
  Minus,
  Plus,
  X,
} from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { route } from "routes-gen"
import { zfd } from "zod-form-data"
import { CharacterFieldCollection } from "~/modules/characters/collections"
import { assert } from "../../helpers/assert"
import { discordIdSchema } from "../../helpers/discord-id"
import { ActionRouter, useActionUi } from "../../helpers/form-action-router"
import { db } from "../../modules/app/db.server"
import { requireWorldOwner } from "../../modules/auth/membership.server"
import { requireSessionUser } from "../../modules/auth/session.server"
import { Field } from "../../modules/ui/field"
import {
  checkboxClass,
  clearButtonClass,
  errorTextClass,
  inputClass,
  maxWidthContainerClass,
  solidButtonClass,
} from "../../modules/ui/styles"
import { getWorld } from "../../modules/world/world-db.server"

const thisRoute = (params: Params) =>
  route("/worlds/:worldId/settings", params as any)

type ActionContext = {
  worldId: string
}

const router = new ActionRouter<ActionContext>()

const updateWorldAction = router.route("updateWorld", {
  input: zfd.formData({ name: zfd.text() }),
  callback: async ({ name }, { worldId }) => {
    await db.world.update({
      where: { id: worldId },
      data: {
        name,
      },
    })
  },
})

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
    world: { name: world.name },
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

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const updateWorld = useActionUi(updateWorldAction, actionData)

  return (
    <div className={maxWidthContainerClass}>
      <div className="grid gap-4 py-4">
        <PageSection title="Overview">
          <updateWorld.Form className="grid gap-4">
            <Field label="World name" errors={updateWorld.fieldErrors?.name}>
              <updateWorld.Input
                name="name"
                defaultValue={data.world.name}
                className={inputClass}
                placeholder="My Awesome World"
              />
            </Field>
            <div>
              <button className={solidButtonClass} type="submit">
                <CheckCircle size={20} /> Save
              </button>
            </div>
            {updateWorld?.errors?.map((error, index) => (
              <p key={index} className={errorTextClass}>
                {error}
              </p>
            ))}
          </updateWorld.Form>
        </PageSection>

        <PageSection title="Players">
          <div className="grid gap-2">
            <AddPlayerForm />
            {data.players.map((player) => (
              <RemovePlayerForm key={player.userDiscordId} player={player} />
            ))}
          </div>
        </PageSection>

        <CharacterFieldsSection />
      </div>
    </div>
  )
}

function PageSection({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-4 rounded-md bg-slate-800 p-4 shadow-md">
      <h2 className="text-3xl font-light">{title}</h2>
      <div>{children}</div>
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
      <div className="flex gap-2">
        <div className="flex-1">
          <p className={inputClass}>
            <span>{player.user.name}</span>
            <span className="ml-1 block opacity-75">
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
      {removePlayer.errors?.map((error, index) => (
        <p key={index} className={errorTextClass}>
          {error}
        </p>
      ))}
    </removePlayer.Form>
  )
}

function CharacterFieldsSection() {
  const fields = CharacterFieldCollection.useItems()
  const mutations = CharacterFieldCollection.useMutations()
  return (
    <PageSection title="Character Fields">
      <div className="grid gap-4">
        {fields.map((field, index) => (
          <div key={field.id} className="border-b-2 border-black/25">
            <CharacterFieldForm field={field} index={index} />
          </div>
        ))}

        <div className="flex">
          <button
            type="button"
            className={solidButtonClass}
            onClick={() => mutations.append({ id: crypto.randomUUID() })}
          >
            <ListPlus /> Add field
          </button>
        </div>
      </div>
    </PageSection>
  )
}

function CharacterFieldForm({
  field,
  index,
}: {
  field: { id: string; description: string; name: string; isLong: boolean }
  index: number
}) {
  const fields = CharacterFieldCollection.useItems()
  const mutations = CharacterFieldCollection.useMutations()

  const nameId = useId()
  const descriptionId = useId()
  const isLongId = useId()

  const labelClass = clsx("select-none pt-3 font-medium leading-tight")

  return (
    <div className="grid auto-rows-[minmax(3rem,auto)] grid-cols-[auto,1fr] gap-x-4 gap-y-1">
      <label className={labelClass} htmlFor={nameId}>
        Label
      </label>
      <input
        id={nameId}
        placeholder="Field name"
        className={inputClass}
        value={field.name}
        onChange={(event) => {
          mutations.update(index, { name: event.target.value })
        }}
      />

      <label className={labelClass} htmlFor={descriptionId}>
        Description
      </label>
      <textarea
        id={descriptionId}
        placeholder="Tell players what to put here."
        className={inputClass}
        rows={2}
        value={field.description}
        onChange={(event) => {
          mutations.update(index, { description: event.target.value })
        }}
      />

      <label className={labelClass} htmlFor={isLongId}>
        Multiline
      </label>
      <div className="flex items-start gap-2 pt-3 leading-tight">
        <input
          id={isLongId}
          type="checkbox"
          className={checkboxClass}
          checked={field.isLong}
          onChange={(event) => {
            mutations.update(index, { isLong: event.target.checked })
          }}
        />

        <div className="flex-1" />

        {index > 0 && (
          <button
            type="button"
            title="Move field up"
            className={clearButtonClass}
            onClick={() => {
              mutations.move(index, index - 1)
            }}
          >
            <ChevronUp />
          </button>
        )}
        {index < fields.length - 1 && (
          <button
            type="button"
            title="Move field down"
            className={clearButtonClass}
            onClick={() => {
              mutations.move(index, index + 1)
            }}
          >
            <ChevronDown />
          </button>
        )}

        <button
          title={`Remove ${field.name}`}
          className={clearButtonClass}
          onClick={() => {
            mutations.remove(index)
          }}
        >
          <X />
        </button>
      </div>
    </div>
  )
}
