import * as RadixPopover from "@radix-ui/react-popover"
import { css, cx } from "styled-system/css"

export function Popover({ children }: { children: React.ReactNode }) {
  return <RadixPopover.Root>{children}</RadixPopover.Root>
}

export function PopoverButton(props: RadixPopover.PopoverTriggerProps) {
  return (
    <RadixPopover.Trigger
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

export function PopoverPanel({
  children,
  side,
  align,
}: {
  children: React.ReactNode
  side: NonNullable<RadixPopover.PopoverContentProps["side"]>
  align: NonNullable<RadixPopover.PopoverContentProps["align"]>
}) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        side={side}
        align={align}
        sideOffset={8}
        className={css({
          bg: "base.800",
          shadow: "lg",
          borderWidth: "1px",
          borderColor: "base.700",
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
      </RadixPopover.Content>
    </RadixPopover.Portal>
  )
}
