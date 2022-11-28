import { Form, useSubmit, useTransition } from "@remix-run/react"
import clsx from "clsx"
import { Eye, EyeOff, Image, ImagePlus, Trash, X } from "lucide-react"
import { Fragment, useState } from "react"
import { route } from "routes-gen"
import { z } from "zod"
import { zfd } from "zod-form-data"
import { getMembership, requireWorldOwner } from "../auth/membership.server"
import { getSessionUser, requireSessionUser } from "../auth/session.server"
import { db } from "../core/db.server"
import { DashboardModule } from "../dashboard/dashboard-module"
import { parseKeys } from "../helpers/parse-keys"
import { getWorldEmitter } from "../routes/worlds.$worldId.events/emitter"
import {
  DebouncedExpandingTextArea,
  DebouncedInput,
} from "../ui/debounced-input"
import { Field } from "../ui/field"
import {
  clearButtonClass,
  inputClass,
  solidButtonClass,
  textAreaClass,
} from "../ui/styles"
import { getWorld } from "../world/world-db.server"

export const galleryModule = new DashboardModule({
  name: "Gallery",
  description: "Visual references for NPCs, maps, etc.",
  icon: <Image />,

  async loader({ request, params }) {
    const { worldId } = parseKeys(params, ["worldId"])

    const [user, world] = await Promise.all([
      getSessionUser(request),
      getWorld(worldId),
    ])

    const membership = user && (await getMembership(user, world))
    const canEdit = membership?.role === "OWNER"

    const where = canEdit ? { worldId } : { worldId, hidden: false }

    const items = await db.galleryItem.findMany({
      where,
      orderBy: { order: "asc" },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        hidden: true,
      },
    })

    return { items, canEdit }
  },

  async action({ request, params }) {
    const { redirect } = await import("@remix-run/node")

    const { worldId } = parseKeys(params, ["worldId"])

    const [user, world] = await Promise.all([
      requireSessionUser(request),
      getWorld(worldId),
    ])

    const membership = await requireWorldOwner(user, world)

    if (request.method === "POST") {
      const count = await db.galleryItem.count({
        where: { worldId },
      })

      await db.galleryItem.create({
        data: {
          imageUrl: "",
          caption: "",
          hidden: membership?.role === "OWNER",
          order: count,
          worldId,
        },
      })

      getWorldEmitter(worldId).emit({ type: "update", sourceUserId: user.id })
    }

    if (request.method === "DELETE") {
      const data = await request.formData()
      await db.galleryItem.delete({ where: { id: data.get("id") as string } })
      getWorldEmitter(worldId).emit({ type: "update", sourceUserId: user.id })
    }

    if (request.method === "PATCH") {
      const schema = zfd.formData({
        id: zfd.text(),
        caption: zfd.text().optional(),
        hidden: zfd
          .text(z.enum(["true", "false"]).transform((v) => v === "true"))
          .optional(),
        imageUrl: zfd.text().optional(),
      })

      const { id, ...data } = schema.parse(await request.formData())
      await db.galleryItem.update({ where: { id }, data })
      getWorldEmitter(worldId).emit({ type: "update", sourceUserId: user.id })
    }

    return redirect(route("/worlds/:worldId/dashboard", { worldId }))
  },

  component: function GalleryModuleView(props) {
    type Item = typeof props.loaderData.items[0]

    const { canEdit } = props.loaderData
    let { items } = props.loaderData

    const { submission } = useTransition()
    if (submission?.action === props.formAction) {
      if (submission.method === "POST") {
        items = [
          ...items,
          { id: "placeholder", imageUrl: "", caption: "", hidden: false },
        ]
      }
      if (submission.method === "DELETE") {
        items = items.filter(
          (item) => item.id !== submission.formData.get("id"),
        )
      }
      if (submission.method === "PATCH") {
        items = items.map((item) => {
          if (item.id !== submission.formData.get("id")) return item
          return {
            ...item,
            imageUrl:
              (submission.formData.get("imageUrl") as string) || item.imageUrl,
            caption:
              (submission.formData.get("caption") as string) || item.caption,
            hidden: submission.formData.has("hidden")
              ? submission.formData.get("hidden") === "true"
              : item.hidden,
          }
        })
      }
    }

    const [currentId, setCurrentId] = useState<Item["id"]>()
    const current = items.find((item) => item.id === currentId)

    const submit = useSubmit()

    const updateItem = (id: string, item: Partial<Item>) => {
      const body = new FormData()
      body.set("id", id)
      if (item.imageUrl) body.set("imageUrl", item.imageUrl)
      if (item.caption) body.set("caption", item.caption)
      if (item.hidden !== undefined) body.set("hidden", String(item.hidden))
      submit(body, { action: props.formAction, method: "patch" })
    }

    return (
      <div className="relative flex h-full w-full">
        <div className="m-auto flex flex-col items-center gap-4 p-4">
          <div className="isolate m-auto grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] place-content-center gap-4">
            {items.map((item, index) => (
              <Fragment key={item.id}>
                <div className="relative aspect-square w-full overflow-clip rounded bg-black/25">
                  <button
                    type="button"
                    onClick={() => setCurrentId(item.id)}
                    className="block h-full w-full ring-blue-500 hover:bg-black/50 focus:outline-none focus-visible:ring-2"
                  >
                    <img
                      src={item.imageUrl}
                      alt={`Gallery item ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                  {canEdit && (
                    <div className="absolute bottom-0 left-0 flex gap-2 p-2">
                      <ToggleHiddenButton
                        {...item}
                        formAction={props.formAction}
                      />
                      <DeleteButton
                        itemId={item.id}
                        formAction={props.formAction}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={clsx(
                    "absolute inset-0 isolate z-10 flex flex-col gap-4 bg-black/75 p-4 backdrop-blur transition-all",
                    current === item
                      ? "visible opacity-100"
                      : "invisible opacity-0",
                  )}
                  role="presentation"
                  onClick={(event) => {
                    if (event.target === event.currentTarget) {
                      setCurrentId(undefined)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setCurrentId(undefined)
                    }
                  }}
                >
                  <div className="flex justify-end">
                    <button
                      type="button"
                      title="Close"
                      className={clearButtonClass}
                      onClick={() => setCurrentId(undefined)}
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="min-h-0 flex-1">
                    <img
                      src={item.imageUrl}
                      alt={`Gallery item ${index + 1}`}
                      className={clsx(
                        "h-full w-full object-contain transition",
                        current === item ? "scale-100" : "scale-90",
                      )}
                      role="presentation"
                      onClick={() => setCurrentId(undefined)}
                    />
                  </div>

                  {canEdit ? (
                    <div className="mx-auto grid w-full max-w-screen-sm gap-4">
                      <div className="flex items-end gap-2">
                        <Field label="Image URL" className="flex-1">
                          <DebouncedInput
                            className={inputClass}
                            type="url"
                            value={item.imageUrl}
                            onChangeText={(imageUrl) => {
                              updateItem(item.id, { imageUrl })
                            }}
                            debouncePeriod={500}
                          />
                        </Field>
                        <ToggleHiddenButton
                          {...item}
                          formAction={props.formAction}
                        />
                        <DeleteButton
                          itemId={item.id}
                          formAction={props.formAction}
                        />
                      </div>

                      <Field label="Caption">
                        <DebouncedExpandingTextArea
                          className={textAreaClass}
                          value={item.caption}
                          placeholder="Describe the image"
                          debouncePeriod={500}
                          onChangeText={(caption) => {
                            updateItem(item.id, { caption })
                          }}
                        />
                      </Field>
                    </div>
                  ) : (
                    <p className="text-center text-lg">{item.caption}</p>
                  )}
                </div>
              </Fragment>
            ))}
            {items.length === 0 && (
              <p className="text-center text-xl font-light italic opacity-75">
                Nothing here!
              </p>
            )}
          </div>

          {canEdit && (
            <Form method="post" action={props.formAction}>
              <button className={solidButtonClass}>
                <ImagePlus /> Add item
              </button>
            </Form>
          )}
        </div>
      </div>
    )
  },
})

function DeleteButton({
  formAction,
  itemId,
}: {
  formAction: string
  itemId: string
}) {
  return (
    <Form method="delete" action={formAction}>
      <input type="hidden" name="id" value={itemId} />
      <button title="Delete" className={solidButtonClass}>
        <Trash />
      </button>
    </Form>
  )
}

function ToggleHiddenButton({
  id,
  hidden,
  formAction,
}: {
  id: string
  hidden: boolean
  formAction: string
}) {
  return (
    <Form method="patch" action={formAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="hidden" value={String(!hidden)} />
      <button
        title="Hidden - click to toggle"
        role="checkbox"
        aria-checked={hidden}
        className={solidButtonClass}
      >
        {hidden ? <EyeOff /> : <Eye />}
      </button>
    </Form>
  )
}
