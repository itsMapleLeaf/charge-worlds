import * as RadixTooltip from "@radix-ui/react-tooltip"
import type { ReactElement, ReactNode } from "react"
import { css } from "styled-system/css"

export function Tooltip({
  content,
  children,
}: {
  content: ReactNode
  children: ReactElement
}) {
  return (
    <RadixTooltip.Root delayDuration={300}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Content
        sideOffset={8}
        side="top"
        align="center"
        className={css({
          p: 1,
          lineHeight: 1,
          fontSize: "sm",
          bg: "base.700",
          borderWidth: 1,
          borderColor: "base.600",
          rounded: "sm",
        })}
      >
        {content}
      </RadixTooltip.Content>
    </RadixTooltip.Root>
  )
}
