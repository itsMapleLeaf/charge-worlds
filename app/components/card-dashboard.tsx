import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { AnimatePresence, motion } from "framer-motion"
import {
  Edit,
  Eye,
  EyeOff,
  File,
  FileMinus2,
  Grip,
  Trash,
  Wand2,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { cardBlockTypes } from "~/components/card-block"
import { Masonry } from "~/components/masonry"
import { WorldContext } from "~/components/world-context"
import { CardCollection } from "~/data/card-collection"
import { type Card, type CardBlock } from "~/data/card-schema"
import { createContextWrapper } from "~/helpers/context"
import { Toolbar, ToolbarButton } from "./toolbar"

const CardDashboardContext = createContextWrapper(
  function useCardDashboardProvider() {
    const [currentDialogCardId, setCurrentDialogCardId] = useState<string>()
    const [editing, setEditing] = useState(true)
    return {
      currentDialogCardId,
      setCurrentDialogCardId,
      editing,
      setEditing,
    }
  },
)

export function CardDashboardLayout(props: { children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <CardDashboardContext.Provider>
        {props.children}
      </CardDashboardContext.Provider>
    </div>
  )
}

export function CardDashboardControls(props: { children: React.ReactNode }) {
  const { isOwner } = WorldContext.useValue()
  return isOwner ? (
    <div className="flex gap-2">
      <ToggleEditingButton />
      {props.children}
    </div>
  ) : null
}

export function CreateCardButton(props: { onCreate?: (id: string) => void }) {
  const mutations = CardCollection.useMutations()
  const { setCurrentDialogCardId } = CardDashboardContext.useValue()
  return (
    <button
      className="button"
      onClick={() => {
        const id = crypto.randomUUID()
        mutations.prepend({
          id,
          title: "New Card",
          hidden: true,
        })
        setCurrentDialogCardId(id)
        props.onCreate?.(id)
      }}
    >
      <Wand2 aria-hidden /> Create Card
    </button>
  )
}

export function ToggleEditingButton() {
  const { editing, setEditing } = CardDashboardContext.useValue()

  return (
    <button
      className="button"
      onClick={() => {
        setEditing(!editing)
      }}
    >
      {editing ? <Eye aria-hidden /> : <Edit aria-hidden />}{" "}
      {editing ? "View" : "Edit"}
    </button>
  )
}

export function CardDashboard(props: {
  visibleCardIds?: string[]
  extraCardControls?: (card: Card, index: number) => ReactNode
}) {
  const { editing } = CardDashboardContext.useValue()
  const { isOwner } = WorldContext.useValue()
  return editing && isOwner ? (
    <CardDashboardEditing {...props} />
  ) : (
    <CardDashboardReadOnly {...props} />
  )
}

function CardDashboardReadOnly(props: { visibleCardIds?: string[] }) {
  const { isOwner } = WorldContext.useValue()
  const cards = CardCollection.useItems()
  const visibleCardIds = props.visibleCardIds && new Set(props.visibleCardIds)

  const mutations = CardCollection.useMutations()

  function handleBlockDataChange(
    card: Card,
    cardIndex: number,
    blockId: string,
    data: JsonObject,
  ) {
    mutations.update(cardIndex, {
      blocks: card.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)),
    })
  }

  return (
    <>
      {cards.length === 0 && <p>Nothing to see here!</p>}
      <Masonry
        items={cards
          .map((card, index) => [card, index] as const)
          .filter(([card]) =>
            visibleCardIds ? visibleCardIds.has(card.id) : true,
          )}
        itemKey={([card]) => card.id}
        columnWidth={256}
        gap={8}
        renderItem={([card, index]) => {
          if (!isOwner && card.hidden) {
            return null
          }
          return (
            <motion.div layoutId={card.id}>
              <CardPanel
                key={card.id}
                card={card}
                onBlockDataChange={(blockId, data) => {
                  handleBlockDataChange(card, index, blockId, data)
                }}
              />
            </motion.div>
          )
        }}
      />
    </>
  )
}

function CardDashboardEditing(props: {
  visibleCardIds?: string[]
  extraCardControls?: (card: Card, index: number) => ReactNode
}) {
  const { isOwner } = WorldContext.useValue()
  const mutations = CardCollection.useMutations()

  let cards = CardCollection.useItems()
  if (!isOwner) {
    cards = cards.filter((card) => !card.hidden)
  }

  const visibleCardIds = props.visibleCardIds && new Set(props.visibleCardIds)

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  return (
    <>
      {cards.length === 0 && <p>Nothing to see here!</p>}

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
          <Masonry
            items={cards
              .map((card, index) => [card, index] as const)
              .filter(([card]) =>
                visibleCardIds ? visibleCardIds.has(card.id) : true,
              )}
            itemKey={([card]) => card.id}
            columnWidth={256}
            gap={8}
            renderItem={([card, index]) => (
              <DragSortableWithHandle id={card.id}>
                {({ handle }) => (
                  <div
                    data-hidden={card.hidden}
                    className="panel divide-y divide-white/10 data-[hidden=true]:opacity-75"
                  >
                    <CardEditor
                      card={card}
                      index={index}
                      dragHandle={handle}
                      extraControls={props.extraCardControls}
                    />
                  </div>
                )}
              </DragSortableWithHandle>
            )}
          />
        </SortableContext>
      </DndContext>
    </>
  )
}

function CardPanel({
  card,
  onBlockDataChange,
}: {
  card: Card
  onBlockDataChange?: (blockId: string, data: JsonObject) => void
}) {
  const { isOwner } = WorldContext.useValue()

  const blocks = isOwner
    ? card.blocks
    : card.blocks.filter((block) => !block.hidden)

  return (
    <article
      data-hidden={card.hidden}
      className="divide-y divide-white/10 panel data-[hidden=true]:opacity-75"
    >
      <header className="flex items-center gap-3 p-3">
        <h3 className="flex-1 text-2xl font-light">
          {card.titleHidden ? "???" : card.title}{" "}
          {isOwner && card.titleHidden && (
            <span className="opacity-75">({card.title})</span>
          )}
        </h3>
      </header>
      <main className="grid max-h-[360px] gap-3 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {blocks.map((block) => {
            const content = (() => {
              const blockType = cardBlockTypes[block.type]
              if (!blockType) {
                return <p>Unknown block type: {block.type}</p>
              }

              return (
                <blockType.StaticComponent
                  data={block.data}
                  onChange={(data) => onBlockDataChange?.(block.id, data)}
                />
              )
            })()

            return (
              <motion.div
                key={block.id}
                layout="position"
                layoutId={block.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="flex-1">{content}</div>
                {block.hidden && (
                  <EyeOff aria-label="Hidden" className="opacity-50" />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </main>
    </article>
  )
}

function CardEditor({
  card,
  index,
  dragHandle,
  extraControls,
}: {
  card: Card
  index: number
  dragHandle: React.ReactNode
  extraControls?: (card: Card, index: number) => ReactNode
}) {
  const mutations = CardCollection.useMutations()

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  function updateBlock(id: string, props: Partial<CardBlock>) {
    mutations.update(index, {
      blocks: card.blocks.map((block) =>
        block.id === id ? { ...block, ...props } : block,
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
    <>
      <div className="relative">
        <input
          title="Card Title"
          placeholder="Card Title"
          value={card.title}
          onChange={(event) => {
            mutations.update(index, { title: event.target.value })
          }}
          data-title-hidden={card.titleHidden}
          className="border-0 rounded-0 text-2xl font-light ring-inset input data-[title-hidden=true]:pr-12"
        />
        {card.titleHidden && (
          <div className="absolute inset-y-0 right-0 px-3 flex items-center justify-center opacity-50">
            <EyeOff />
          </div>
        )}
      </div>

      <Toolbar>
        {dragHandle}
        <ToolbarButton
          label={card.titleHidden ? "Show title" : "Hide title"}
          icon={card.titleHidden ? EyeOff : Eye}
          onClick={() => {
            mutations.update(index, { titleHidden: !card.titleHidden })
          }}
        />
        <ToolbarButton
          label={card.hidden ? "Show card" : "Hide card"}
          icon={card.hidden ? FileMinus2 : File}
          onClick={() => {
            mutations.update(index, { hidden: !card.hidden })
          }}
        />
        {extraControls?.(card, index)}
        <ToolbarButton
          label="Delete card"
          icon={Trash}
          onClick={() => {
            mutations.remove(index)
          }}
        />
      </Toolbar>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto max-h-[16rem]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={card.blocks}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-2 p-2">
              {card.blocks.map((block) => {
                const content = (() => {
                  const blockType = cardBlockTypes[block.type]
                  if (!blockType) {
                    return <p>Unknown block type: {block.type}</p>
                  }

                  return (
                    <section aria-label={`${block.type} block`}>
                      <blockType.EditorComponent
                        data={block.data}
                        onChange={(data) => updateBlock(block.id, { data })}
                      />
                    </section>
                  )
                })()

                return (
                  <DragSortableWithHandle id={block.id} key={block.id}>
                    {({ handle }) => (
                      <CardBlockControls
                        block={block}
                        dragHandle={handle}
                        onDelete={() => {
                          deleteBlock(block.id)
                        }}
                        onToggleHidden={() => {
                          updateBlock(block.id, {
                            hidden: !block.hidden,
                          })
                        }}
                      >
                        {content}
                      </CardBlockControls>
                    )}
                  </DragSortableWithHandle>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Toolbar>
        {Object.entries(cardBlockTypes).map(([name, type]) => (
          <ToolbarButton
            key={name}
            label={`Add ${name} block`}
            icon={type.icon}
            onClick={() => {
              mutations.update(index, {
                blocks: [
                  ...card.blocks,
                  {
                    id: crypto.randomUUID(),
                    type: name,
                    hidden: false,
                    data: type.initialData,
                  },
                ],
              })
            }}
          />
        ))}
      </Toolbar>
    </>
  )
}

function CardBlockControls(props: {
  block: CardBlock
  children: ReactNode
  dragHandle: ReactNode
  onDelete: () => void
  onToggleHidden: () => void
}) {
  return (
    <div className="flex flex-col divide-y divide-white/10 panel">
      {props.children}
      <Toolbar>
        {props.dragHandle}
        <ToolbarButton
          label={props.block.hidden ? "Show block" : "Hide block"}
          icon={props.block.hidden ? EyeOff : Eye}
          onClick={props.onToggleHidden}
        />
        <ToolbarButton
          label="Delete block"
          icon={Trash}
          onClick={props.onDelete}
        />
      </Toolbar>
    </div>
  )
}

function DragSortableWithHandle({
  children,
  id,
}: {
  children: (args: { handle: ReactNode }) => React.ReactNode
  id: string
}) {
  const sortable = useSortable({ id })

  const handle = (
    <button
      {...sortable.attributes}
      {...sortable.listeners}
      ref={sortable.setActivatorNodeRef}
      data-dragging={sortable.isDragging || undefined}
      className="cursor-grab px-1.5 text-center data-[dragging]:cursor-grabbing"
    >
      <Grip className="inline leading-4 s-4" aria-label="Drag to rearrange" />
    </button>
  )

  return (
    <div
      ref={sortable.setNodeRef}
      style={{
        transition: sortable.transition,
        transform: CSS.Translate.toString(sortable.transform),
        zIndex: sortable.isDragging ? 10 : undefined,
      }}
    >
      {children({ handle })}
    </div>
  )
}
