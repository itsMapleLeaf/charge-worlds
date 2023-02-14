import { Dialog, DialogDismiss, useDialogState } from "ariakit"
import clsx from "clsx"
import { Eye, EyeOff, Image, ImagePlus, Trash, X } from "lucide-react"
import type { ReactNode } from "react"
import { Fragment, useState } from "react"
import ExpandingTextArea from "react-expanding-textarea"
import { z } from "zod"
import { useAuthContext } from "~/modules/auth/auth-context"
import { defineLiveblocksListCollection } from "~/modules/liveblocks/collection"
import { DashboardModule } from "../dashboard/dashboard-module"
import { Field } from "../ui/field"
import {
  clearButtonClass,
  inputClass,
  solidButtonClass,
  textAreaClass,
} from "../ui/styles"

const galleryItemSchema = z.object({
  id: z.string(),
  imageUrl: z.string().optional(),
  caption: z.string().default(""),
  hidden: z.boolean().default(true),
})
export type GalleryItemInput = z.input<typeof galleryItemSchema>
type GalleryItem = z.output<typeof galleryItemSchema>

const GalleryCollection = defineLiveblocksListCollection(
  "gallery",
  galleryItemSchema,
)

export const galleryModule = new DashboardModule({
  name: "Gallery",
  description: "Visual references for NPCs, maps, etc.",
  icon: <Image />,

  component: function GalleryModuleView() {
    const { isOwner } = useAuthContext()

    let items = GalleryCollection.useItems()
    if (!isOwner) {
      items = items.filter((item) => !item.hidden)
    }

    const mutations = GalleryCollection.useMutations()

    const [currentId, setCurrentId] = useState<GalleryItem["id"]>()
    const [overlayVisible, setOverlayVisible] = useState(false)
    const current = items.find((item) => item.id === currentId)

    const showOverlay = (id: GalleryItem["id"]) => {
      setCurrentId(id)
      setOverlayVisible(true)
    }

    const updateItem = (input: GalleryItemInput) => {
      mutations.updateWhere((item) => item.id === input.id, input)
    }

    return (
      <div className="relative h-full">
        <div className="thin-scrollbar flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-scroll">
          <div className="m-auto flex flex-col items-center gap-4 p-4">
            <div className="isolate m-auto grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] place-content-center gap-4">
              {items.map((item, index) => (
                <Fragment key={item.id}>
                  <div className="group relative aspect-square w-full overflow-clip rounded bg-black/25">
                    <button
                      type="button"
                      onClick={() => showOverlay(item.id)}
                      className="block h-full w-full ring-inset ring-blue-500 hover:bg-black/50 focus:outline-none focus-visible:ring-2"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={`Gallery item ${index + 1}`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Image
                          className="mx-auto h-24 w-24 opacity-75"
                          aria-label="No image found"
                        />
                      )}
                    </button>
                    {isOwner && (
                      <div className="absolute bottom-0 left-0 flex gap-2 p-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                        <ToggleHiddenButton {...item} />
                        <DeleteButton itemId={item.id} />
                      </div>
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
            {isOwner && (
              <button
                type="button"
                className={solidButtonClass}
                onClick={() => mutations.append({ id: crypto.randomUUID() })}
              >
                <ImagePlus /> Add item
              </button>
            )}
          </div>
        </div>

        <LightboxOverlay
          visible={overlayVisible}
          onVisibleChange={setOverlayVisible}
        >
          {current && (
            <div className="flex h-full flex-col gap-6">
              <div className="min-h-0 flex-1">
                {current.imageUrl ? (
                  <img
                    src={current.imageUrl}
                    alt=""
                    className={clsx(
                      "h-full w-full object-contain transition",
                      overlayVisible ? "scale-100" : "scale-90",
                    )}
                    role="presentation"
                    onClick={() => setOverlayVisible(false)}
                  />
                ) : (
                  <p>No image found</p>
                )}
              </div>

              {isOwner ? (
                <div className="mx-auto grid w-full max-w-screen-sm gap-4">
                  <div className="flex items-end gap-2">
                    <Field label="Image URL" className="flex-1">
                      <input
                        className={inputClass}
                        type="url"
                        value={current.imageUrl}
                        onChange={(event) => {
                          updateItem({
                            id: current.id,
                            imageUrl: event.target.value,
                          })
                        }}
                      />
                    </Field>
                    <ToggleHiddenButton {...current} />
                    <DeleteButton itemId={current.id} />
                  </div>

                  <Field label="Caption">
                    <ExpandingTextArea
                      className={textAreaClass}
                      placeholder="Describe the image"
                      value={current.caption}
                      onChange={(event) => {
                        updateItem({
                          id: current.id,
                          caption: event.target.value,
                        })
                      }}
                    />
                  </Field>
                </div>
              ) : (
                <p className="whitespace-pre-line text-center text-lg">
                  {current.caption}
                </p>
              )}
            </div>
          )}
        </LightboxOverlay>
      </div>
    )
  },
})

function DeleteButton({ itemId }: { itemId: string }) {
  const mutations = GalleryCollection.useMutations()
  return (
    <button
      title="Delete"
      className={solidButtonClass}
      onClick={() => {
        mutations.removeWhere((item) => item.id === itemId)
      }}
    >
      <Trash />
    </button>
  )
}

function ToggleHiddenButton({ id, hidden }: { id: string; hidden: boolean }) {
  const mutations = GalleryCollection.useMutations()
  return (
    <button
      title="Hidden - click to toggle"
      role="checkbox"
      aria-checked={hidden}
      className={solidButtonClass}
      onClick={() => {
        mutations.updateWhere((item) => item.id === id, {
          id,
          hidden: !hidden,
        })
      }}
    >
      {hidden ? <EyeOff /> : <Eye />}
    </button>
  )
}

function LightboxOverlay({
  visible,
  children,
  onVisibleChange,
}: {
  visible: boolean
  children: ReactNode
  onVisibleChange: (visible: boolean) => void
}) {
  const dialog = useDialogState({
    open: visible,
    setOpen: onVisibleChange,
    animated: true,
  })
  return (
    <Dialog
      state={dialog}
      className="group fixed inset-0 flex flex-col gap-4 p-4 transition-opacity data-[enter]:opacity-100 data-[leave]:opacity-0"
      backdropProps={{
        className: clsx(
          "bg-black/75 backdrop-blur",
          "transition-opacity data-[enter]:opacity-100 data-[leave]:opacity-0",
        ),
      }}
    >
      <div className="flex justify-end">
        <DialogDismiss className={clearButtonClass}>
          <X size={24} />
        </DialogDismiss>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto transition-transform group-data-[enter]:scale-100 group-data-[leave]:scale-90">
        {children}
      </div>
    </Dialog>
  )
}
