import * as RadixPopover from "@radix-ui/react-popover"
import { css } from "styled-system/css"

export const Popover = RadixPopover.Root
export const PopoverButton = RadixPopover.Trigger

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
				sideOffset={12}
				className={css({
					bg: "base.800",
					shadow: "lg",
					borderWidth: "1px",
					borderColor: "base.700",
					rounded: "md",
					overflow: "clip",
					"&[data-state=open]": { animation: "fade-rise-in" },
					"&[data-state=closed]": { animation: "fade-rise-out" },
				})}
			>
				{children}
			</RadixPopover.Content>
		</RadixPopover.Portal>
	)
}
