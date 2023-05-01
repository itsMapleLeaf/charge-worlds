import * as Popover from "@radix-ui/react-popover"
import { cx } from "class-variance-authority"
import { Plus, Trash } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { z } from "zod"
import { CardCollection } from "~/modules/cards/card-collection"
import {
  CardDashboard,
  CardDashboardControls,
  CardDashboardLayout,
  CreateCardButton,
} from "~/modules/cards/card-dashboard"
import { defineLiveblocksListCollection } from "~/modules/liveblocks/collection"
import { button } from "~/modules/ui/button"
import { interactable } from "~/modules/ui/panel"

const sceneSchema = z.object({
  cards: z.array(z.string()).default([]),
})

const SceneCollection = defineLiveblocksListCollection("scenes", sceneSchema)

const defaultScene: z.output<typeof sceneSchema> = {
  cards: [],
}

export default function ScenePage() {
  const scene = SceneCollection.useItems()[0]
  const mutations = SceneCollection.useMutations()
  return (
    <section aria-label="Scene">
      <CardDashboardLayout>
        <CardDashboardControls>
          <CreateCardButton
            onCreate={(id) => {
              if (scene) {
                mutations.update(0, {
                  cards: [...scene.cards, id],
                })
              } else {
                mutations.append({
                  ...defaultScene,
                  cards: [id],
                })
              }
            }}
          />
          <AddCardButton />
          <button
            className={button()}
            onClick={() => {
              mutations.update(0, {
                cards: [],
              })
            }}
          >
            <Trash /> Clear Scene
          </button>
        </CardDashboardControls>
        <CardDashboard visibleCardIds={scene?.cards ?? []} />
      </CardDashboardLayout>
    </section>
  )
}

function AddCardButton() {
  const scene = SceneCollection.useItems()[0]
  const visibleCards = new Set(scene?.cards ?? [])
  const mutations = SceneCollection.useMutations()
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const cards = CardCollection.useItems().filter(
    (card) => !visibleCards.has(card.id),
  )

  const items = matchSorter(cards, query, {
    keys: ["title"],
  })

  const addCard = (id: string) => {
    if (scene) {
      mutations.update(0, {
        cards: [...scene.cards, id],
      })
    } else {
      mutations.append({
        ...defaultScene,
        cards: [id],
      })
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger className={button()}>
        <Plus /> Add Card
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="animate-from-opacity-0 animate-from-scale-95 data-[state=open]:animate-in data-[state=closed]:animate-out w-64 panel"
          sideOffset={8}
          onKeyDown={(event) => {
            const focusTargets = [
              ...event.currentTarget.querySelectorAll<HTMLElement>(
                "button, input",
              ),
            ]

            const focusedIndex = focusTargets.indexOf(
              document.activeElement as HTMLElement,
            )

            const negativeMod = (n: number, m: number) => ((n % m) + m) % m

            if (event.key === "ArrowUp") {
              focusTargets[
                negativeMod(focusedIndex - 1, focusTargets.length)
              ]?.focus()
              event.preventDefault()
            } else if (event.key === "ArrowDown") {
              focusTargets[
                negativeMod(focusedIndex + 1, focusTargets.length)
              ]?.focus()
              event.preventDefault()
            }
          }}
        >
          <input
            className={cx(
              interactable(),
              "w-full min-w-0 border-b border-white/10 bg-transparent px-3 py-2",
            )}
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && items[0]) {
                e.preventDefault()
                addCard(items[0].id)
              }
            }}
            ref={inputRef}
          />
          <div className="h-64">
            <Virtuoso
              data={items}
              itemContent={(_, item) => (
                <button
                  key={item.id}
                  className={cx(
                    interactable(),
                    "w-full text-ellipsis whitespace-nowrap px-3 py-2 text-left",
                  )}
                  onClick={() => {
                    addCard(item.id)
                    inputRef.current?.focus()
                  }}
                >
                  {item.title}
                </button>
              )}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
