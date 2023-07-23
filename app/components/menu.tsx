import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"

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
          bg: "neutral.700",
          shadow: "lg",
          shadowColor: "neutral.950",
          borderWidth: "thin",
          borderStyle: "solid",
          borderColor: "neutral.600",
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
        hstack({
          px: "3",
          py: "2",
          gap: "2",
          transition: "common",
          _first: { roundedTop: "md" },
          _last: { roundedBottom: "md" },
          _hover: { bg: "neutral.600", boxShadow: "none" },
        }),
        props.className,
      )}
    />
  )
}
