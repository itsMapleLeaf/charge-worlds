import type { ComponentPropsWithoutRef } from "react"
import { css, cx } from "styled-system/css"

export function Label({
	children,
	className,
	...props
}: ComponentPropsWithoutRef<"label">) {
	return (
		<label
			{...props}
			className={cx(
				css({ fontSize: "sm", fontWeight: "medium", lineHeight: 1 }),
				className,
			)}
		>
			{children}
		</label>
	)
}
