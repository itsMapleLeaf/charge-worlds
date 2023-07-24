import {
  LucideChevronLeft,
  LucideChevronRight,
  LucideDices,
} from "lucide-react"
import { useState } from "react"
import { css, cx } from "styled-system/css"
import { grid, gridItem, hstack } from "styled-system/patterns"
import { button, circleButton } from "~/components/button"
import { input } from "~/components/input"
import { MenuItem } from "~/components/menu"
import { Popover, PopoverButton, PopoverPanel } from "~/components/popover"
import { Select } from "~/components/select"

export function DiceMenuButton() {
  return (
    <Popover defaultOpen>
      <PopoverButton className={circleButton()}>
        <LucideDices />
        <span className={css({ srOnly: true })}>Dice Rolls</span>
      </PopoverButton>
      <PopoverPanel side="top" align="center">
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            w: 64,
            h: "min(calc(100vh - 8rem), 640px)",
            divideY: "1px",
            divideColor: "base.700",
          })}
        >
          <div className={css({ flex: 1 })}>the</div>
          <div className={css({ p: 2 })}>
            <DiceForm />
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

function DiceForm() {
  return (
    <div className={grid({ gridTemplateColumns: "1fr auto", gap: 2 })}>
      <input className={input()} placeholder="Move +1" />

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

      <button type="button" className={cx(button(), gridItem({ colSpan: 2 }))}>
        Push Yourself (-2 Momentum)
      </button>

      <DicePoolSizeCounter />
      <button className={button()}>
        <LucideDices /> Roll
      </button>
    </div>
  )
}

function DicePoolSizeCounter() {
  const [value, setValue] = useState(0)
  return (
    <div
      className={hstack({
        justify: "center",
        minW: 0,
        w: "full",
        bg: "base.700",
        borderWidth: 1,
        borderColor: "base.600",
        rounded: "md",
        px: 1,
        h: 10,
        color: "inherit",
        gap: 0.5,
      })}
    >
      <button type="button" onClick={() => setValue((v) => v - 1)}>
        <LucideChevronLeft />
      </button>
      <p
        className={css({
          fontVariantNumeric: "tabular-nums",
          minW: 6,
          textAlign: "center",
        })}
      >
        {value}
      </p>
      <button type="button" onClick={() => setValue((v) => v + 1)}>
        <LucideChevronRight />
      </button>
    </div>
  )
}
