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
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "framer-motion"
import {
  Edit,
  Eye,
  EyeOff,
  Grip,
  Trash,
  Wand2,
  type LucideIcon,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { createContextWrapper } from "~/helpers/context"
import { cardBlockTypes } from "~/modules/cards/card-block-types"
import { CardCollection } from "~/modules/cards/card-collection"
import { type Card, type CardBlock } from "~/modules/cards/card-schema"
import { button } from "~/modules/ui/button"
import { ControlsOverlay } from "~/modules/ui/controls-overlay"
import {
  Dialog,
  DialogButton,
  DialogModalPanel,
  DialogOverlay,
  DialogTitle,
} from "~/modules/ui/dialog"
import { Masonry } from "~/modules/ui/masonry"
import { panel } from "~/modules/ui/panel"
import { WorldContext } from "~/modules/world/world-context"

const Context = createContextWrapper(function useCardDashboardProvider() {
  const [currentDialogCardId, setCurrentDialogCardId] = useState<string>()
  return {
    currentDialogCardId,
    setCurrentDialogCardId,
  }
})

export function CardDashboardLayout(props: { children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Context.Provider>{props.children}</Context.Provider>
    </div>
  )
}

export function CardDashboardControls(props: { children: React.ReactNode }) {
  const { isOwner } = WorldContext.useValue()
  return isOwner ? <div className="flex gap-2">{props.children}</div> : null
}

export function CreateCardButton(props: { onCreate?: (id: string) => void }) {
  const mutations = CardCollection.useMutations()
  const { setCurrentDialogCardId } = Context.useValue()
  return (
    <button
      className={button({ shadow: "default" })}
      onClick={() => {
        const id = crypto.randomUUID()
        mutations.append({
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

export function CardDashboard(props: { visibleCardIds?: string[] }) {
  const { isOwner } = WorldContext.useValue()
  const mutations = CardCollection.useMutations()

  let cards = CardCollection.useItems()
  if (!isOwner) {
    cards = cards.filter((card) => !card.hidden)
  }

  const visibleCardIds = props.visibleCardIds && new Set(props.visibleCardIds)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    }),
  )

  function handleBlockDataChange(
    card: Card,
    cardIndex: number,
    blockId: string,
    data: any,
  ) {
    mutations.update(cardIndex, {
      blocks: card.blocks.map((b) => (b.id === blockId ? { ...b, data } : b)),
    })
  }

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
            renderItem={([card, index]) => {
              if (!isOwner) {
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
              }

              return (
                <DragSortable id={card.id}>
                  <ControlsOverlay
                    controls={
                      <CardEditorDialog cardId={card.id}>
                        <CardEditor card={card} index={index} />
                      </CardEditorDialog>
                    }
                  >
                    <CardPanel
                      key={card.id}
                      card={card}
                      onBlockDataChange={(blockId, data) => {
                        handleBlockDataChange(card, index, blockId, data)
                      }}
                    />
                  </ControlsOverlay>
                </DragSortable>
              )
            }}
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
  onBlockDataChange: (blockId: string, data: any) => void
}) {
  const { isOwner } = WorldContext.useValue()

  const blocks = isOwner
    ? card.blocks
    : card.blocks.filter((block) => !block.hidden)

  return (
    <article className={cx(panel(), "divide-y divide-white/10")}>
      <header className="flex items-center gap-3 p-3">
        <h3 className="flex-1 text-2xl font-light">{card.title}</h3>
        {card.hidden && <EyeOff aria-label="Hidden" className="opacity-50" />}
      </header>
      <main className="grid max-h-[360px] gap-3 overflow-y-auto p-3">
        <AnimatePresence initial={false}>
          {blocks.map((block) => {
            const content = (() => {
              const blockType = cardBlockTypes[block.type]
              if (!blockType) {
                return <p>Unknown block type: {block.type}</p>
              }

              const result = blockType.schema.safeParse(block.data)
              if (!result.success) {
                return <p>Invalid block data: {result.error.message}</p>
              }

              return (
                <blockType.StaticComponent
                  data={result.data}
                  onChange={(data) => onBlockDataChange(block.id, data)}
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

function CardEditorDialog(props: {
  cardId: string
  children: React.ReactNode
}) {
  const context = Context.useValue()
  return (
    <Dialog
      open={context.currentDialogCardId === props.cardId}
      onOpenChange={(open) => {
        context.setCurrentDialogCardId(open ? props.cardId : undefined)
      }}
    >
      <DialogButton title="Edit" className={button()}>
        <Edit aria-hidden />
      </DialogButton>
      <DialogOverlay>
        <DialogModalPanel>
          <DialogTitle className="p-3 text-center text-3xl font-light">
            Edit Card
          </DialogTitle>
          {props.children}
        </DialogModalPanel>
      </DialogOverlay>
    </Dialog>
  )
}

function CardEditor({ card, index }: { card: Card; index: number }) {
  const mutations = CardCollection.useMutations()

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

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
    <>
      <input
        title="Card Title"
        placeholder="Card Title"
        value={card.title}
        onChange={(event) => {
          mutations.update(index, { title: event.target.value })
        }}
        className="w-full bg-transparent p-2 text-2xl font-light transition focus:text-foreground-8 focus:ring-0"
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
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

                  const result = blockType.schema.safeParse(block.data)
                  if (!result.success) {
                    return <p>Invalid block data: {result.error.message}</p>
                  }

                  return (
                    <section aria-label={`${block.type} block`}>
                      <blockType.EditorComponent
                        data={result.data}
                        onChange={(data) => {
                          updateBlock(block.id, { data })
                        }}
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
        "block !h-10 justify-center",
      )}
      onClick={props.onClick}
    >
      <props.icon aria-hidden className="!s-4" />
    </button>
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
      className={cx(
        "px-1.5 text-center",
        sortable.isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
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

function DragSortable({
  children,
  id,
}: {
  children: React.ReactNode
  id: string
}) {
  const sortable = useSortable({ id, transition: null })
  return (
    <motion.div
      {...sortable.attributes}
      {...sortable.listeners}
      ref={sortable.setNodeRef}
      layoutId={id}
      className={sortable.isDragging ? "cursor-grabbing" : "cursor-grab"}
      animate={
        sortable.transform && sortable.isDragging
          ? {
              x: sortable.transform.x,
              y: sortable.transform.y,
              opacity: 0.75,
            }
          : {
              x: 0,
              y: 0,
              opacity: sortable.isOver ? 0.5 : 1,
            }
      }
      transition={{
        duration: sortable.isDragging ? 0 : 0.35,
      }}
      style={{
        zIndex: sortable.isDragging ? 10 : undefined,
      }}
    >
      {children}
    </motion.div>
  )
}
