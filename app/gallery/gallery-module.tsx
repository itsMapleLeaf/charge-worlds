import clsx from "clsx"
import { Eye, EyeOff, Image, Trash, X } from "lucide-react"
import { Fragment, useState } from "react"
import { db } from "../core/db.server"
import { DashboardModule } from "../dashboard/dashboard-module"
import { parseKeys } from "../helpers/parse-keys"
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

export const galleryModule = new DashboardModule({
  name: "Gallery",
  description: "Visual references for NPCs, maps, etc.",
  icon: <Image />,

  async loader({ request, params }) {
    const { worldId } = parseKeys(params, ["worldId"])

    const items = await db.galleryItem.findMany({
      where: { worldId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        hidden: true,
      },
    })

    return { items }
  },

  component: function GalleryModuleView(data) {
    type Item = typeof data.loaderData.items[0]

    const [items, setItems] = useState(data.loaderData.items)
    const [currentId, setCurrentId] = useState<Item["id"]>()
    const current = items.find((item) => item.id === currentId)

    const updateItem = (id: string, item: Partial<Item>) => {
      setItems((items) =>
        items.map((i) => (i.id === id ? { ...i, ...item } : i)),
      )
    }

    return (
      <div className="relative flex h-full w-full flex-col">
        <div className="isolate m-auto grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] place-content-center gap-4 p-4">
          {items.map((item, index) => (
            <Fragment key={item.id}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrentId(item.id)}
                  className="block overflow-clip rounded bg-black/25 ring-blue-500 transition hover:bg-black/50 focus:outline-none focus-visible:ring-2"
                >
                  <img
                    src={item.imageUrl}
                    alt={`Gallery item ${index + 1}`}
                    className="aspect-square object-contain"
                  />
                </button>

                <div className="absolute bottom-0 left-0 flex gap-2 p-2">
                  <button
                    type="button"
                    title="Hidden - click to toggle"
                    role="checkbox"
                    aria-checked={item.hidden}
                    className={solidButtonClass}
                    onClick={() => {
                      updateItem(item.id, { hidden: !item.hidden })
                    }}
                  >
                    {item.hidden ? <EyeOff /> : <Eye />}
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    className={solidButtonClass}
                  >
                    <Trash />
                  </button>
                </div>
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
                  if (event.key === "Escape") setCurrentId(undefined)
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
                    <button
                      type="button"
                      title="Hidden - click to toggle"
                      role="checkbox"
                      aria-checked={item.hidden}
                      className={solidButtonClass}
                      onClick={() => {
                        updateItem(item.id, { hidden: !item.hidden })
                      }}
                    >
                      {item.hidden ? <EyeOff /> : <Eye />}
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className={solidButtonClass}
                    >
                      <Trash />
                    </button>
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
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    )
  },
})
