import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"
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
import type { LucideIcon } from "lucide-react"
import { Eye, EyeOff, Grip, Image, PlusSquare, Trash, Type } from "lucide-react"
import type { ReactNode } from "react"
import { Fragment } from "react"
import TextArea from "react-expanding-textarea"
import { CardCollection } from "~/modules/cards/card-collection"
import type { Card, CardBlock } from "~/modules/cards/card-schema"
import { button } from "~/modules/ui/button"
import { panel } from "~/modules/ui/panel"
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
  const [animateRef] = useAutoAnimate()
  return (
    <article className={panel()} key={card.id} ref={animateRef}>
      <h3 className="border-b border-white/10 p-3 text-2xl font-light">
        {card.title}
      </h3>
      {card.blocks.map((block) => (
        <Fragment key={block.id}>
          {block.type === "text" ? (
            <p className="my-3 whitespace-pre-line px-3">{block.text}</p>
          ) : block.type === "image" ? (
            <img
              src={block.src}
              alt=""
              className="h-auto w-full object-cover"
            />
          ) : null}
        </Fragment>
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

  function updateBlock(id: string, props: Partial<CardBlock>) {
    mutations.update(index, {
      blocks: card.blocks.map((block) =>
        block.id === id ? { ...block, ...(props as {}) } : block,
      ),
    })
  }

  function deleteBlock(id: string) {
    mutations.update(index, {
      blocks: card.blocks.filter((block) => block.id !== id),
    })
  }

  function handleDragEnd({ over, active }: DragEndEvent) {
    if (over && active) {
      const overIndex = card.blocks.findIndex((block) => block.id === over.id)
      const activeIndex = card.blocks.findIndex(
        (block) => block.id === active.id,
      )
      mutations.update(index, {
        blocks: arrayMove(card.blocks, activeIndex, overIndex),
      })
    }
  }

  return (
    <DragSortable id={card.id}>
      {({ handle }) => (
        <div className={cx(panel(), "divide-y divide-white/10")}>
          <input
            title="Card Title"
            placeholder="Card Title"
            value={card.title}
            onChange={(event) => {
              mutations.update(index, { title: event.target.value })
            }}
            className="min-w-0 flex-1 bg-transparent p-2 text-2xl font-light transition focus:text-foreground-8 focus:ring-0"
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={card.blocks}>
              <div className="grid gap-2 p-2" ref={animateRef}>
                {card.blocks.map((block) => (
                  <DragSortable id={block.id} key={block.id}>
                    {({ handle }) => (
                      <CardBlockControls
                        dragHandle={handle}
                        onDelete={() => {
                          deleteBlock(block.id)
                        }}
                      >
                        {block.type === "text" ? (
                          <CardTextBlockEditor
                            block={block}
                            onChangeText={(text) => {
                              updateBlock(block.id, { text })
                            }}
                          />
                        ) : block.type === "image" ? (
                          <CardImageBlockEditor
                            block={block}
                            onChangeSrc={(src) => {
                              updateBlock(block.id, { src })
                            }}
                          />
                        ) : null}
                      </CardBlockControls>
                    )}
                  </DragSortable>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Toolbar>
            {handle}
            <ToolbarButton
              label="Add text block"
              icon={Type}
              onClick={() => {
                mutations.update(index, {
                  blocks: [
                    ...card.blocks,
                    { id: crypto.randomUUID(), type: "text", text: "" },
                  ],
                })
              }}
            />
            <ToolbarButton
              label="Add image block"
              icon={Image}
              onClick={() => {
                mutations.update(index, {
                  blocks: [
                    ...card.blocks,
                    { id: crypto.randomUUID(), type: "image", src: "" },
                  ],
                })
              }}
            />
            <ToolbarButton
              label={card.hidden ? "Show card" : "Hide card"}
              icon={card.hidden ? EyeOff : Eye}
              onClick={() => {
                mutations.update(index, { hidden: !card.hidden })
              }}
            />
            <ToolbarButton
              label="Delete card"
              icon={Trash}
              onClick={() => {
                mutations.remove(index)
              }}
            />
          </Toolbar>
        </div>
      )}
    </DragSortable>
  )
}

function CardBlockControls(props: {
  children: ReactNode
  dragHandle: ReactNode
  onDelete: () => void
}) {
  return (
    <div
      className={cx(
        panel({ shadow: "none" }),
        "flex flex-col divide-y divide-white/10",
      )}
    >
      {props.children}
      <Toolbar>
        {props.dragHandle}
        <ToolbarButton
          label="Delete block"
          icon={Trash}
          onClick={props.onDelete}
        />
      </Toolbar>
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
      rows={1}
      className="min-w-0 resize-none bg-transparent p-2 transition focus:text-foreground-8 focus:ring-0"
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
    <div className="divide-y divide-white/10">
      <img src={block.src} alt="" className="aspect-square object-contain" />
      <input
        title="Card Image"
        placeholder="https://some.image/link.png"
        value={block.src}
        onChange={(event) => {
          onChangeSrc(event.target.value)
        }}
        className="w-full min-w-0 flex-1 bg-transparent p-2 transition focus:text-foreground-8 focus:ring-0"
      />
    </div>
  )
}

function Toolbar(props: { children: ReactNode }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col divide-x divide-white/10">
      {props.children}
    </div>
  )
}

function ToolbarButton(props: {
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      title={props.label}
      className={cx(
        button({ border: "none", background: "none" }),
        "block justify-center !h-10",
      )}
      onClick={props.onClick}
    >
      <props.icon aria-hidden className="!s-4" />
    </button>
  )
}

function DragSortable({
  children,
  id,
}: {
  children: (args: { handle: ReactNode }) => React.ReactNode
  id: UniqueIdentifier
}) {
  const sortable = useSortable({ id, transition: null })

  const handle = (
    <button
      {...sortable.attributes}
      {...sortable.listeners}
      className={cx(
        "px-1.5 text-center",
        sortable.isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      <Grip
        className="inline leading-4 s-4"
        aria-label="Click and hold to rearrange"
      />
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
