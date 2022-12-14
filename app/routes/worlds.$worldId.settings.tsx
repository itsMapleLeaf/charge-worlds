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
import { z } from "zod"
import { zfd } from "zod-form-data"
import { requireWorldOwner } from "../auth/membership.server"
import { requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { assert } from "../helpers/assert"
import { discordIdSchema } from "../helpers/discord-id"
import { raise } from "../helpers/errors"
import { ActionRouter, useActionUi } from "../helpers/form-action-router"
import { Field } from "../ui/field"
import {
  checkboxClass,
  clearButtonClass,
  errorTextClass,
  inputClass,
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

const updateCharacterFieldsAction = router.route("updateCharacterFields", {
  input: zfd.formData({
    fields: zfd.repeatableOfType(
      zfd.formData({
        id: zfd.text(),
        name: zfd.text(z.string().max(256)),
        description: zfd.text(z.string().max(1024).optional()),
        isLong: zfd.checkbox(),
      }),
    ),
  }),
  callback: async ({ fields }, { worldId }) => {
    await db.world.update({
      where: { id: worldId },
      data: {
        characterFields: {
          update: fields.map(({ id, ...data }) => ({ where: { id }, data })),
        },
      },
    })
  },
})

const reorderCharacterFieldAction = router.route("reorderCharacterField", {
  input: zfd.formData({
    fieldId: zfd.text(),
    direction: zfd.text(z.union([z.literal("up"), z.literal("down")])),
  }),
  callback: async ({ fieldId, direction }, { worldId }) => {
    const currentFields = await db.characterField.findMany({
      where: { worldId },
      orderBy: { order: "asc" },
      select: { id: true },
    })

    const currentFieldIndex = currentFields.findIndex((f) => f.id === fieldId)
    if (currentFieldIndex === -1) raise(`Field ${fieldId} not found`)

    if (direction === "up") {
      const removed = currentFields.splice(currentFieldIndex, 1)
      currentFields.splice(currentFieldIndex - 1, 0, ...removed)
    } else {
      const removed = currentFields.splice(currentFieldIndex, 1)
      currentFields.splice(currentFieldIndex + 1, 0, ...removed)
    }

    await db.world.update({
      where: { id: worldId },
      data: {
        characterFields: {
          update: currentFields.map(({ id }, order) => ({
            where: { id },
            data: { order },
          })),
        },
      },
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
    orderBy: { order: "asc" },
    select: { id: true, name: true, description: true, isLong: true },
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
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const addCharacterField = useActionUi(addCharacterFieldAction, actionData)
  const updateCharacterFields = useActionUi(
    updateCharacterFieldsAction,
    actionData,
  )
  const removeCharacterField = useActionUi(
    removeCharacterFieldAction,
    actionData,
  )

  const updateFormId = useId()

  return (
    <PageSection title="Character Fields">
      <div className="grid gap-2">
        {[
          addCharacterField.errors,
          updateCharacterFields.errors,
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

      <div className="grid gap-4">
        <updateCharacterFields.Form className="contents" id={updateFormId} />

        {data.characterFields.map((field, index) => (
          <div key={field.id} className="border-b-2 border-black/25">
            <CharacterFieldForm
              field={field}
              index={index}
              canMoveUp={index > 0}
              canMoveDown={index < data.characterFields.length - 1}
              formId={updateFormId}
            />
          </div>
        ))}

        <div className="flex">
          <addCharacterField.Form>
            <button className={solidButtonClass} type="submit">
              <ListPlus /> Add field
            </button>
          </addCharacterField.Form>

          <div className="flex-1" />

          <button
            className={solidButtonClass}
            type="submit"
            form={updateFormId}
          >
            <CheckCircle size={20} /> Save
          </button>
        </div>
      </div>
    </PageSection>
  )
}

function CharacterFieldForm({
  formId,
  field,
  index,
  canMoveUp,
  canMoveDown,
}: {
  formId: string
  field: { id: string; description: string; name: string; isLong: boolean }
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
}) {
  const actionData = useActionData<typeof action>()

  const nameId = useId()
  const descriptionId = useId()
  const isLongId = useId()

  const removeCharacterField = useActionUi(
    removeCharacterFieldAction,
    actionData,
  )

  const reorderCharacterFields = useActionUi(
    reorderCharacterFieldAction,
    actionData,
  )

  const labelClass = clsx("select-none pt-3 font-medium leading-tight")

  return (
    <div className="grid auto-rows-[minmax(3rem,auto)] grid-cols-[auto,1fr] gap-x-4 gap-y-1">
      <input
        type="hidden"
        name={`fields[${index}].id`}
        value={field.id}
        form={formId}
      />

      <label className={labelClass} htmlFor={nameId}>
        Label
      </label>
      <input
        id={nameId}
        name={`fields[${index}].name`}
        defaultValue={field.name}
        className={inputClass}
        placeholder="Field name"
        form={formId}
      />

      <label className={labelClass} htmlFor={descriptionId}>
        Description
      </label>
      <textarea
        id={descriptionId}
        name={`fields[${index}].description`}
        defaultValue={field.description}
        className={inputClass}
        placeholder="Tell players what to put here."
        form={formId}
        rows={2}
      />

      <label className={labelClass} htmlFor={isLongId}>
        Multiline
      </label>
      <div className="flex items-start gap-2 pt-3 leading-tight">
        <input
          id={isLongId}
          name={`fields[${index}].isLong`}
          required={false}
          type="checkbox"
          defaultChecked={field.isLong}
          form={formId}
          className={checkboxClass}
        />

        <div className="flex-1" />

        <reorderCharacterFields.Form className="contents">
          <reorderCharacterFields.HiddenInput name="fieldId" value={field.id} />
          {canMoveUp && (
            <button
              className={clearButtonClass}
              type="submit"
              name="direction"
              value="up"
              title="Move field up"
            >
              <ChevronUp />
            </button>
          )}
          {canMoveDown && (
            <button
              className={clearButtonClass}
              type="submit"
              name="direction"
              value="down"
              title="Move field down"
            >
              <ChevronDown />
            </button>
          )}
        </reorderCharacterFields.Form>

        <removeCharacterField.Form method="post" className="contents">
          <removeCharacterField.HiddenInput name="id" value={field.id} />
          <button className={clearButtonClass} title={`Remove ${field.name}`}>
            <X />
          </button>
        </removeCharacterField.Form>
      </div>
    </div>
  )
}
