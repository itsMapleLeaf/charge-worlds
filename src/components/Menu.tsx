import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"

export const Menu = Dropdown.Root
export const MenuButton = Dropdown.Trigger

export function MenuPanel({
	children,
	side,
	align,
}: {
	children: React.ReactNode
	side: NonNullable<Dropdown.MenuContentProps["side"]>
	align: NonNullable<Dropdown.MenuContentProps["align"]>
}) {
	return (
		<Dropdown.Portal>
			<Dropdown.Content
				side={side}
				sideOffset={12}
				align={align}
				className={css({
					bg: "base.700",
					shadow: "lg",
					borderWidth: "1px",
					borderColor: "base.600",
					rounded: "md",
					minW: 40,
					overflowX: "clip",
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
				<div className={css({ maxH: 72, overflowY: "auto" })}>{children}</div>
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
					gap: 1.5,
					px: 3,
					h: 10,
					rounded: "0px",
					borderWidth: "2px",
					borderColor: "transparent",
					transition: "background",
					cursor: "pointer",
					_hover: { bg: "base.600" },
					_focusVisible: { outline: "none", borderColor: "accent.400" },
					_first: { roundedTop: "sm" },
					_last: { roundedBottom: "sm" },
				}),
				props.className,
			)}
		/>
	)
}
