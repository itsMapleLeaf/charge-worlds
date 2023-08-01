import { css, cx } from "styled-system/css"
import { grid } from "styled-system/patterns"

export function Spinner({
	size,
	className,
}: {
	size: 8 | 12
	className?: string
}) {
	return (
		<div
			className={cx(
				grid({
					columns: 2,
					gap: 1,
					w: size,
					h: size,
					animation: "spin",
					mx: "auto",
				}),
				className,
			)}
		>
			<div className={css({ h: "full", rounded: "full", bg: "accent.300" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.400" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.400" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.300" })} />
		</div>
	)
}
