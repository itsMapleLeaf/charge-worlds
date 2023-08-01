import * as Dropdown from "@radix-ui/react-dropdown-menu"
import { css, cx } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"

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
					maxW: 72,
					overflowX: "clip",
					"&[data-state=open]": { animation: "fade-rise-in" },
					"&[data-state=closed]": { animation: "fade-rise-out" },
				})}
			>
				<div
					className={flex({
						maxH: 72,
						overflowY: "auto",
						flexDir: "column",
						minW: 0,
					})}
				>
					{children}
				</div>
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
					minH: 10,
					rounded: "0px",
					borderWidth: "2px",
					borderColor: "transparent",
					transition: "background",
					cursor: "pointer",
					wordBreak: "break-word",
					_hover: { bg: "base.600" },
					_focusVisible: { outline: "none", borderColor: "accent.400" },
					_first: { roundedTop: "sm" },
					_last: { roundedBottom: "sm" },
					"& > svg": { w: 5, h: 5 },
				}),
				props.className,
			)}
		/>
	)
}
