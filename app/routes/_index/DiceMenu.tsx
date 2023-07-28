import { LucideDices } from "lucide-react"
import type { ReactElement } from "react"
import { useState } from "react"
import { css } from "styled-system/css"
import { flex, grid } from "styled-system/patterns"
import { Counter } from "~/components/Counter"
import { button } from "~/components/button"
import { MenuItem } from "~/components/menu"
import { Popover, PopoverButton, PopoverPanel } from "~/components/popover"
import { Select } from "~/components/select"
import { Field } from "../../components/Field"

const views = [
  { id: "action", name: "Action", component: ActionDiceForm },
  { id: "fortune", name: "Fortune", component: () => <></> },
  { id: "other", name: "Other", component: () => <></> },
] as const
type View = (typeof views)[number]

export function DiceMenu({ children }: { children: ReactElement }) {
  const [viewId, setViewId] = useState<View["id"]>(views[0].id)
  const currentView = views.find((v) => v.id === viewId) ?? views[0]
  return (
    <Popover>
      <PopoverButton asChild>{children}</PopoverButton>
      <PopoverPanel side="top" align="center">
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            w: 64,
            h: "min(calc(100vh - 8rem), 720px)",
            divideY: "1px",
            divideColor: "base.700",
          })}
        >
          <div className={css({ flex: 1 })}>the</div>

          <currentView.component />

          <div
            className={grid({
              gap: 0,
              gridAutoFlow: "column",
              gridAutoColumns: "fr",
            })}
          >
            {views.map((view) => (
              <button
                key={view.id}
                type="button"
                className={css({
                  lineHeight: 1,
                  p: 2,
                  fontSize: "sm",
                  fontWeight: "medium",
                  transition: "common",
                  bg: view === currentView ? "base.700" : undefined,
                  _hover: { color: "accent.400" },
                })}
                onClick={() => setViewId(view.id)}
              >
                {view.name}
              </button>
            ))}
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

function ActionDiceForm() {
  return (
    <div className={flex({ direction: "column", p: 2, gap: 2 })}>
      <div className={grid({ gridTemplateColumns: 2, gap: 2 })}>
        <Field label="Action">
          <Select label="Actions">
            <MenuItem>Move</MenuItem>
            <MenuItem>Finesse</MenuItem>
            <MenuItem>Endure</MenuItem>
            <MenuItem>Recall</MenuItem>
            <MenuItem>Move</MenuItem>
            <MenuItem>Finesse</MenuItem>
            <MenuItem>Endure</MenuItem>
            <MenuItem>Recall</MenuItem>
            <MenuItem>Move</MenuItem>
            <MenuItem>Finesse</MenuItem>
            <MenuItem>Endure</MenuItem>
            <MenuItem>Recall</MenuItem>
          </Select>
        </Field>
        <Field label="Modifier">
          <Counter />
        </Field>
      </div>
      <hr
        className={css({
          borderBottom: "none",
          borderTopWidth: 1,
          borderColor: "base.700",
        })}
      />
      <button type="button" className={button({ align: "start" })}>
        <LucideDices /> Roll
      </button>
      <button type="button" className={button({ align: "start" })}>
        <LucideDices /> Roll (Push Yourself)
      </button>
    </div>
  )
}
