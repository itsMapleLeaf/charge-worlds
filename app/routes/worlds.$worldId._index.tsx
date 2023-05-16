import * as Popover from "@radix-ui/react-popover"
import { Plus, Trash, X } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { z } from "zod"
import {
  CardDashboard,
  CardDashboardControls,
  CardDashboardLayout,
  CreateCardButton,
} from "~/components/card-dashboard"
import { ToolbarButton } from "~/components/toolbar"
import { CardCollection } from "~/data/card-collection"
import { defineLiveblocksListCollection } from "~/data/liveblocks-collection"

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
            className="glass panel button"
            onClick={() => {
              mutations.update(0, {
                cards: [],
              })
            }}
          >
            <Trash /> Clear Scene
          </button>
        </CardDashboardControls>
        <CardDashboard
          visibleCardIds={scene?.cards ?? []}
          extraCardControls={(card) => <RemoveCardButton id={card.id} />}
        />
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
      <Popover.Trigger className="glass panel button">
        <Plus /> Add Card
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="glass panel radix-zoom-fade-transition w-64 origin-top"
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
            className="input panel panel-border-b rounded-t-md border-0"
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
                  className="button h-10 w-full border-0"
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

function RemoveCardButton({ id }: { id: string }) {
  const scene = SceneCollection.useItems()[0]
  const mutations = SceneCollection.useMutations()
  return (
    <ToolbarButton
      label="Remove Card"
      icon={X}
      onClick={() => {
        if (scene) {
          mutations.update(0, {
            cards: scene.cards.filter((cardId) => cardId !== id),
          })
        }
      }}
    />
  )
}
