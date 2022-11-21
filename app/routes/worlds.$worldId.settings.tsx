import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { Params } from "@remix-run/react"
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react"
import { Minus, Plus, Save, X } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { requireWorldOwner } from "../auth/membership"
import { requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { assert } from "../helpers/assert"
import { discordIdSchema } from "../helpers/discord-id"
import { FormAction, FormActionGroup } from "../helpers/form"
import { useDebouncedCallback } from "../helpers/use-debounced-callback"
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

const updateWorld = new FormAction({
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

const addPlayer = new FormAction({
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

const removePlayer = new FormAction({
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

const addCharacterField = new FormAction({
  fields: {},
  async action(values, { params }) {
    await db.characterField.create({
      data: {
        name: "New Field",
        isLong: false,
        worldId: params.worldId!,
      },
    })
  },
})

const updateCharacterField = new FormAction({
  fields: {
    id: z.string(),
    name: z.string().max(256),
    isLong: z
      .enum(["on"])
      .optional()
      .transform((v) => v === "on"),
  },
  async action({ id, ...data }, { params }) {
    await db.characterField.update({
      where: { id },
      data,
    })
  },
})

const removeCharacterField = new FormAction({
  fields: {
    id: z.string(),
  },
  async action({ id }, { params }) {
    await db.characterField.delete({ where: { id } })
  },
})

const actionGroup = new FormActionGroup({
  updateWorld,

  addPlayer,
  removePlayer,

  addCharacterField,
  updateCharacterField,
  removeCharacterField,
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

  return actionGroup.handleSubmit(args, thisRoute(args.params))
}

export default function SettingsPage() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  return (
    <div className={maxWidthContainerClass}>
      <div className="grid gap-4 py-4">
        <PageSection title="Overview">
          <Form method="post" className="grid gap-4">
            <input {...actionGroup.types.updateWorld} />
            <Field
              label="World name"
              errors={actionData?.updateWorld?.fieldErrors?.name}
            >
              <input
                {...updateWorld.fields.name.input}
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
            {actionData?.updateWorld?.globalError && (
              <p className={errorTextClass}>
                {actionData?.updateWorld?.globalError}
              </p>
            )}
          </Form>
        </PageSection>

        <PageSection title="Players">
          <div className="grid gap-2">
            <AddPlayerForm />
            {data.players.map((player) => (
              <RemovePlayerForm key={player.userDiscordId} player={player} />
            ))}
          </div>
        </PageSection>

        <PageSection title="Character Fields">
          <div className="grid gap-2">
            {[
              actionData?.addCharacterField?.globalError,
              actionData?.updateCharacterField?.globalError,
              actionData?.removeCharacterField?.globalError,
            ]
              .filter(Boolean)
              .map((error, index) => (
                <p key={index} className={errorTextClass}>
                  {error}
                </p>
              ))}
          </div>

          <div className="grid gap-2">
            {actionData?.updateCharacterField?.fieldErrors?.name?.map(
              (error, index) => (
                <p key={index} className={errorTextClass}>
                  {error}
                </p>
              ),
            )}

            <CharacterFieldsList />

            <Form method="post">
              <input {...actionGroup.types.addCharacterField} />
              <button className={solidButtonClass} type="submit">
                <Plus /> Add Field
              </button>
            </Form>
          </div>
        </PageSection>
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

  useEffect(() => {
    if (transition.state === "idle" && !actionData?.addPlayer?.hasErrors) {
      formRef.current!.reset()
    }
  }, [actionData?.addPlayer?.hasErrors, transition.state])

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
      {actionData?.removePlayer?.globalError && (
        <p className={errorTextClass}>
          {actionData?.removePlayer?.globalError}
        </p>
      )}
    </Form>
  )
}

function CharacterFieldsList() {
  const data = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

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
  const formRef = useRef<HTMLFormElement>(null)
  const submit = useSubmit()

  const submitDebounced = useDebouncedCallback(
    () => submit(formRef.current!),
    500,
  )

  return (
    <Form method="post" className="contents" ref={formRef}>
      <input {...actionGroup.types.updateCharacterField} />
      <input {...updateCharacterField.fields.id.hidden(field.id)} />
      <div role="cell">
        <input
          {...updateCharacterField.fields.name.input}
          defaultValue={field.name}
          className={inputClass}
          placeholder="Field name"
          onChange={submitDebounced}
        />
      </div>
      <div role="cell" className="place-self-center">
        <input
          {...updateCharacterField.fields.isLong.input}
          required={false}
          type="checkbox"
          defaultChecked={field.isLong}
          onChange={submitDebounced}
        />
      </div>

      <Form
        role="cell"
        method="post"
        className="place-self-center leading-none"
      >
        <input {...actionGroup.types.removeCharacterField} />
        <input {...removeCharacterField.fields.id.hidden(field.id)} />
        <button className={clearButtonClass} title="Remove">
          <X />
        </button>
      </Form>

      <div role="cell" className="place-self-center leading-none">
        <button className={clearButtonClass} type="submit" title="Save">
          <Save />
        </button>
      </div>
    </Form>
  )
}
