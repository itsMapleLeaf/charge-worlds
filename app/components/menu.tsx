import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { css, cx } from "styled-system/css"
import { button } from "./button"

export function Menu({ children }: { children: React.ReactNode }) {
  return <Dropdown.Root>{children}</Dropdown.Root>
}

export function MenuButton(props: Dropdown.DropdownMenuTriggerProps) {
  return (
    <Dropdown.Trigger
      {...props}
      className={cx(
        css({
          _hover: { opacity: 0.5 },
          transition: "opacity",
          rounded: "full",
        }),
        props.className,
      )}
    />
  )
}

export function MenuPanel({ children }: { children: React.ReactNode }) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content
        align="end"
        sideOffset={8}
        className={css({
          bg: "base.700",
          shadow: "lg",
          borderWidth: "1px",
          borderColor: "base.600",
          rounded: "md",
          "&[data-state=open]": {
            animation: "100ms fadeRiseIn",
            animationTimingFunction: "ease-out",
          },
          "&[data-state=closed]": {
            animation: "100ms fadeRiseOut",
            animationTimingFunction: "ease-in",
          },
        })}
      >
        {children}
      </Dropdown.Content>
    </Dropdown.Portal>
  )
}

export function MenuItem(props: Dropdown.DropdownMenuItemProps) {
  return (
    <Dropdown.Item
      {...props}
      className={cx(
        button(),
        css({
          rounded: "0px",
          borderWidth: "2px",
          borderColor: "transparent",
          _focusVisible: {
            ring: "none",
            borderColor: "accent.400",
          },
          _first: { roundedTop: "sm" },
          _last: { roundedBottom: "sm" },
        }),
        props.className,
      )}
    />
  )
}
