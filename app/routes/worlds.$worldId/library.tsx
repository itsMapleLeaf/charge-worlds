import type { UniqueIdentifier } from "@dnd-kit/core"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { cx } from "class-variance-authority"
import {
  Eye,
  EyeOff,
  GripVertical,
  Image,
  PlusSquare,
  Trash,
  Type,
} from "lucide-react"
import type { ReactNode } from "react"
import TextArea from "react-expanding-textarea"
import { CardCollection } from "~/modules/cards/card-collection"
import type { Card, CardBlock } from "~/modules/cards/card-schema"
import { button } from "~/modules/ui/button"
import { panel } from "~/modules/ui/panel"
import { dividerClass } from "~/modules/ui/styles"
import { WorldContext } from "~/modules/world/world-context"

export default function LibraryPage() {
  const { isOwner } = WorldContext.useValue()

  let cards = CardCollection.useItems()
  if (!isOwner) {
    cards = cards.filter((card) => !card.hidden)
  }

  const mutations = CardCollection.useMutations()

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [animateRef] = useAutoAnimate()

  return (
    <section className="grid gap-4" aria-label="Library">
      {isOwner && (
        <div>
          <button
            className={button({ shadow: "default" })}
            onClick={() => {
              mutations.append({
                id: crypto.randomUUID(),
                title: "New Card",
                hidden: true,
              })
            }}
          >
            <PlusSquare aria-hidden /> Add Card
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ over, active }) => {
          if (over && active) {
            const overIndex = cards.findIndex((card) => card.id === over.id)
            const activeIndex = cards.findIndex((card) => card.id === active.id)
            mutations.move(activeIndex, overIndex)
          }
        }}
      >
        <SortableContext items={cards}>
          {cards.length > 0 && (
            <div
              className="grid items-start gap-2 fluid-cols-64"
              ref={animateRef}
            >
              {cards.map((card, index) =>
                isOwner ? (
                  <CardEditor key={card.id} card={card} index={index} />
                ) : (
                  <CardPanel key={card.id} card={card} />
                ),
              )}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {cards.length === 0 && <p>Nothing to see here!</p>}
    </section>
  )
}

function CardPanel({ card }: { card: Card }) {
  return (
    <article className={panel()} key={card.id}>
      <h3 className="border-b border-white/10 p-3 text-2xl font-light">
        {card.title}
      </h3>
      {card.blocks.map((block, index) => (
        <div key={index}>
          {block.type === "text" ? (
            <p className="my-3 whitespace-pre-line px-3">{block.text}</p>
          ) : block.type === "image" ? (
            <img
              src={block.src}
              alt=""
              className="h-auto w-full object-cover"
            />
          ) : null}
        </div>
      ))}
    </article>
  )
}

function CardEditor({
  card,
  index,
}: {
  card: Card
  index: number
}): JSX.Element {
  const mutations = CardCollection.useMutations()

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [animateRef] = useAutoAnimate()

  return (
    <Draggable id={card.id}>
      {({ handle }) => (
        <div className={panel()} ref={animateRef}>
          <div className="flex min-w-0">
            {handle}
            <input
              title="Card Title"
              placeholder="Card Title"
              value={card.title}
              onChange={(event) => {
                mutations.update(index, { title: event.target.value })
              }}
              className="min-w-0 flex-1 bg-transparent py-2 pr-2 text-2xl font-light transition focus:text-foreground-8 focus:ring-0"
            />
          </div>

          <hr className={dividerClass} />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ over, active }) => {
              if (over && active) {
                const overIndex = card.blocks.findIndex(
                  (block) => block.id === over.id,
                )
                const activeIndex = card.blocks.findIndex(
                  (block) => block.id === active.id,
                )
                mutations.update(index, {
                  blocks: arrayMove(card.blocks, activeIndex, overIndex),
                })
              }
            }}
          >
            <SortableContext items={card.blocks}>
              {card.blocks.map((block) => (
                <Draggable id={block.id} key={block.id}>
                  {({ handle }) => (
                    <div className="flex min-w-0 items-center">
                      {handle}
                      <div className="flex min-w-0 flex-1 items-center">
                        {block.type === "text" ? (
                          <CardTextBlockEditor
                            block={block}
                            onChangeText={(text) => {
                              mutations.update(index, {
                                blocks: card.blocks.map((b) =>
                                  b.id === block.id ? { ...b, text } : b,
                                ),
                              })
                            }}
                          />
                        ) : block.type === "image" ? (
                          <CardImageBlockEditor
                            block={block}
                            onChangeSrc={(src) => {
                              mutations.update(index, {
                                blocks: card.blocks.map((b) =>
                                  b.id === block.id ? { ...b, src } : b,
                                ),
                              })
                            }}
                          />
                        ) : null}
                      </div>
                      <button
                        title="Delete block"
                        className="px-1.5"
                        onClick={() => {
                          mutations.update(index, {
                            blocks: card.blocks.filter(
                              (b) => b.id !== block.id,
                            ),
                          })
                        }}
                      >
                        <Trash className="s-5" aria-hidden />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
            </SortableContext>
          </DndContext>

          <hr className={dividerClass} />

          <div className="grid auto-cols-fr grid-flow-col">
            <button
              title="Add text block"
              className={cx(
                button({ border: "none", background: "none" }),
                "block justify-center",
              )}
              onClick={() => {
                mutations.update(index, {
                  blocks: [
                    ...card.blocks,
                    { id: crypto.randomUUID(), type: "text", text: "" },
                  ],
                })
              }}
            >
              <Type aria-hidden />
            </button>
            <button
              title="Add image block"
              className={cx(
                button({ border: "none", background: "none" }),
                "block justify-center",
              )}
              onClick={() => {
                mutations.update(index, {
                  blocks: [
                    ...card.blocks,
                    { id: crypto.randomUUID(), type: "image", src: "" },
                  ],
                })
              }}
            >
              <Image aria-hidden />
            </button>
            <button
              title="Toggle hidden"
              className={cx(
                button({ border: "none", background: "none" }),
                "block justify-center",
              )}
              onClick={() => {
                mutations.update(index, { hidden: !card.hidden })
              }}
            >
              {card.hidden ? (
                <EyeOff aria-label="Hidden" />
              ) : (
                <Eye aria-label="Visible" />
              )}
            </button>
            <button
              title="Delete card"
              className={cx(
                button({ border: "none", background: "none" }),
                "block justify-center",
              )}
              onClick={() => {
                mutations.remove(index)
              }}
            >
              <Trash aria-hidden />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  )
}

function Draggable({
  children,
  id,
}: {
  children: (args: { handle: ReactNode }) => React.ReactNode
  id: UniqueIdentifier
}) {
  const sortable = useSortable({ id, transition: null })

  const handle = (
    <button {...sortable.attributes} {...sortable.listeners} className="px-1.5">
      <GripVertical className="s-5" aria-label="Click and hold to rearrange" />
    </button>
  )

  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transform: sortable.isDragging
          ? CSS.Translate.toString(sortable.transform)
          : undefined,
        opacity: sortable.isOver ? 0.5 : 1,
        transition: "0.2s opacity",
        zIndex: sortable.isDragging ? 10 : undefined,
      }}
    >
      {children({ handle })}
    </div>
  )
}

function CardTextBlockEditor({
  block,
  onChangeText,
}: {
  block: CardBlock<"text">
  onChangeText: (text: string) => void
}) {
  return (
    <TextArea
      title="Card Text"
      placeholder="Write something interesting!"
      value={block.text}
      onChange={(event) => {
        onChangeText(event.target.value)
      }}
      className="min-w-0 flex-1 resize-none bg-transparent py-2 pr-2 transition focus:text-foreground-8 focus:ring-0"
    />
  )
}

function CardImageBlockEditor({
  block,
  onChangeSrc,
}: {
  block: CardBlock<"image">
  onChangeSrc: (src: string) => void
}) {
  return (
    <div>
      <img src={block.src} alt="" className="aspect-square object-contain" />
      <input
        title="Card Image"
        placeholder="https://some.image/link.png"
        value={block.src}
        onChange={(event) => {
          onChangeSrc(event.target.value)
        }}
        className="w-full min-w-0 flex-1 bg-transparent py-2 pr-2 transition focus:text-foreground-8 focus:ring-0"
      />
    </div>
  )
}
