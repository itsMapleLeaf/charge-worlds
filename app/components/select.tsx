import { LucideChevronDown } from "lucide-react"
import { css } from "styled-system/css"
import { button } from "~/components/button"
import { Menu, MenuButton, MenuPanel } from "~/components/menu"

export function Select({
  children,
  label,
}: {
  children: React.ReactNode
  label: React.ReactNode
}) {
  return (
    <Menu>
      <MenuButton className={button()}>
        <span className={css({ flex: 1, textAlign: "left" })}>{label}</span>
        <LucideChevronDown />
      </MenuButton>
      <MenuPanel side="bottom" align="start">
        {children}
      </MenuPanel>
    </Menu>
  )
}
