import * as Dialog from "@radix-ui/react-dialog"
import { LucideX } from "lucide-react"
import { type ReactNode } from "react"
import { css, cx } from "styled-system/css"
import { flex, hstack } from "styled-system/patterns"

export const Modal = Dialog.Root
export const ModalTrigger = Dialog.Trigger

export function ModalContent({
	children,
	...props
}: Dialog.DialogContentProps) {
	return (
		<Dialog.Portal>
			<Dialog.Overlay
				className={flex({
					position: "fixed",
					inset: 0,
					flexDir: "column",
					p: 4,
					bg: "rgba(0 0 0 / 0.5)",
					backdropFilter: "auto",
					backdropBlur: "sm",
					overflowY: "auto",
					'&[data-state="open"]': { animation: "fade-in" },
					'&[data-state="closed"]': { animation: "fade-out" },
				})}
			>
				<Dialog.Content
					{...props}
					className={cx(
						flex({
							bg: "base.800",
							borderWidth: 1,
							borderColor: "base.700",
							rounded: "md",
							shadow: "lg",
							w: "full",
							maxW: "3xl",
							m: "auto",
							flexDir: "column",
							'&[data-state="open"]': { animation: "fade-rise-in" },
							'&[data-state="closed"]': { animation: "fade-rise-out" },
						}),
						props.className,
					)}
				>
					{children}
				</Dialog.Content>
			</Dialog.Overlay>
		</Dialog.Portal>
	)
}

export function ModalHeader({ children }: { children: ReactNode }) {
	return (
		<header
			className={hstack({
				py: 3,
				px: 4,
				bg: "base.900",
				borderBottomWidth: 1,
				borderColor: "base.700",
				roundedTop: "md",
			})}
		>
			{children}
			<Dialog.Close className={css({ ml: "auto" })}>
				<LucideX size={24} />
				<span className={css({ srOnly: true })}>Close</span>
			</Dialog.Close>
		</header>
	)
}

export function ModalTitle(props: Dialog.DialogTitleProps) {
	return (
		<Dialog.Title
			{...props}
			className={cx(
				css({
					fontSize: "2xl",
					fontWeight: "light",
					lineHeight: "tight",
					flex: 1,
					minW: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}),
				props.className,
			)}
		/>
	)
}
