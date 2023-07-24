import {
  LucideDices,
  LucideUser,
  LucideUsers,
  LucideWrench,
} from "lucide-react"
import { css } from "styled-system/css"
import { hstack } from "styled-system/patterns"
import { circleButton } from "~/components/button"

export default function Home() {
  return (
    <>
      <main className={css({ flex: 1 })}>the</main>
      <footer
        className={hstack({ mx: "auto", pos: "sticky", pb: "max(1rem, 4vh)" })}
      >
        <button className={circleButton()}>
          <LucideUser />
          <span className={css({ srOnly: true })}>Your Characters</span>
        </button>
        <button className={circleButton()}>
          <LucideDices />
          <span className={css({ srOnly: true })}>Dice Rolls</span>
        </button>
        <button className={circleButton()}>
          <LucideUsers />
          <span className={css({ srOnly: true })}>Players</span>
        </button>
        <button className={circleButton()}>
          <LucideWrench />
          <span className={css({ srOnly: true })}>World Settings</span>
        </button>
      </footer>
    </>
  )
}
