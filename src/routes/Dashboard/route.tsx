import { LucideDices, LucideUser } from "lucide-react"
import type { ReactNode } from "react"
import { forwardRef } from "react"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"
import { Tooltip } from "~/components/Tooltip"
import { circleButton } from "~/styles/button"
import { DiceMenu } from "./DiceMenu"

export function Dashboard() {
  return (
    <>
      <main className={css({ flex: 1 })}>the</main>
      <footer
        className={hstack({ mx: "auto", pos: "sticky", pb: "max(1rem, 4vh)" })}
      >
        <PrimaryActionButton name="Your Characters">
          <LucideUser />
        </PrimaryActionButton>

        <DiceMenu>
          <PrimaryActionButton name="Dice">
            <LucideDices />
          </PrimaryActionButton>
        </DiceMenu>
      </footer>
    </>
  )
}

const PrimaryActionButton = forwardRef<
  HTMLButtonElement,
  JSX.IntrinsicElements["button"] & { name: ReactNode }
>(function PrimaryActionButton({ name, ...props }, ref) {
  return (
    <Tooltip content={name}>
      <button
        {...props}
        className={cx(circleButton(), props.className)}
        ref={ref}
      />
    </Tooltip>
  )
})
