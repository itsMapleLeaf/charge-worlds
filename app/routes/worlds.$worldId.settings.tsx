import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { Params } from "@remix-run/react"
import {
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react"
import { Minus, Plus, Save, X } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { requireWorldOwner } from "../auth/membership"
import { requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { assert } from "../helpers/assert"
import { discordIdSchema } from "../helpers/discord-id"
import { ActionRouter, useActionUi } from "../helpers/form-action-router"
import { useDebouncedCallback } from "../helpers/use-debounced-callback"
import { useHydrated } from "../helpers/use-hydrated"
import { Field } from "../ui/field"
import {
  clearButtonClass,
  errorTextClass,
  inputClass,
  labelTextClass,
  maxWidthContainerClass,
  solidButtonClass,
} from "../ui/styles"
import { getWorld } from "../world/world-db.server"

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

const addCharacterFieldAction = router.route("addCharacterField", {
  callback: async (data, { worldId }) => {
    await db.characterField.create({
      data: { name: "New Field", isLong: false, worldId },
    })
  },
})

const updateCharacterFieldAction = router.route("updateCharacterField", {
  input: zfd.formData({
    id: zfd.text(),
    name: zfd.text(z.string().max(256)),
    isLong: zfd.checkbox(),
  }),
  callback: async ({ id, ...data }, { worldId }) => {
    await db.characterField.update({
      where: { id },
      data,
    })
  },
})

const removeCharacterFieldAction = router.route("removeCharacterField", {
  input: zfd.formData({ id: zfd.text() }),
  callback: async ({ id }, { worldId }) => {
    await db.characterField.delete({ where: { id } })
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

  const characterFields = await db.characterField.findMany({
    where: { worldId: world.id },
    orderBy: { id: "desc" },
    select: { id: true, name: true, isLong: true },
  })

  return json({
    players,
    world: { name: world.name },
    characterFields,
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
                <Save /> Save
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
  const actionData = useActionData<typeof action>()

  const addCharacterField = useActionUi(addCharacterFieldAction, actionData)
  const updateCharacterField = useActionUi(
    updateCharacterFieldAction,
    actionData,
  )
  const removeCharacterField = useActionUi(
    removeCharacterFieldAction,
    actionData,
  )

  return (
    <PageSection title="Character Fields">
      <div className="grid gap-2">
        {[
          addCharacterField.errors,
          updateCharacterField.errors,
          removeCharacterField.errors,
        ]
          .flat()
          .filter(Boolean)
          .map((error, index) => (
            <p key={index} className={errorTextClass}>
              {error}
            </p>
          ))}
      </div>

      <div className="grid gap-2">
        <CharacterFieldsList />
        <addCharacterField.Form>
          <button className={solidButtonClass} type="submit">
            <Plus /> Add Field
          </button>
        </addCharacterField.Form>
      </div>
    </PageSection>
  )
}

function CharacterFieldsList() {
  const data = useLoaderData<typeof loader>()

  return (
    <div
      className="grid grid-cols-[1fr,auto,auto,auto] gap-2"
      role="table"
      aria-label="Character Fields Table"
    >
      <div role="row" className="contents">
        <div role="columnheader" className={labelTextClass}>
          Name
        </div>
        <div role="columnheader" className={labelTextClass}>
          Long?
        </div>
        <div></div>
        <div></div>
      </div>

      {data.characterFields.map((field) => (
        <div key={field.id} role="row" className="contents">
          <CharacterFieldForm field={field} />
        </div>
      ))}
    </div>
  )
}

function CharacterFieldForm({
  field,
}: {
  field: { id: string; name: string; isLong: boolean }
}) {
  const actionData = useActionData<typeof action>()
  const formRef = useRef<HTMLFormElement>(null)
  const hydrated = useHydrated()

  const submit = useSubmit()
  const submitDebounced = useDebouncedCallback(
    () => submit(formRef.current!),
    500,
  )

  const updateCharacterField = useActionUi(
    updateCharacterFieldAction,
    actionData,
  )
  const removeCharacterField = useActionUi(
    removeCharacterFieldAction,
    actionData,
  )

  return (
    <updateCharacterField.Form className="contents" ref={formRef}>
      <updateCharacterField.HiddenInput name="id" value={field.id} />
      <div role="cell">
        <updateCharacterField.Input
          name="name"
          defaultValue={field.name}
          className={inputClass}
          placeholder="Field name"
          onChange={submitDebounced}
        />
      </div>
      <div role="cell" className="place-self-center">
        <updateCharacterField.Input
          name="isLong"
          required={false}
          type="checkbox"
          defaultChecked={field.isLong}
          onChange={submitDebounced}
        />
      </div>

      <removeCharacterField.Form
        role="cell"
        method="post"
        className="place-self-center leading-none"
      >
        <removeCharacterField.HiddenInput name="id" value={field.id} />
        <button className={clearButtonClass} title="Remove">
          <X />
        </button>
      </removeCharacterField.Form>

      <div role="cell" className="place-self-center leading-none">
        <div className={hydrated ? "hidden" : "contents"}>
          <button className={clearButtonClass} type="submit" title="Save">
            <Save />
          </button>
        </div>
      </div>
    </updateCharacterField.Form>
  )
}
