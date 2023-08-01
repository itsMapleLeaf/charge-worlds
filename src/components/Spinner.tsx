import { type ComponentPropsWithoutRef } from "react"
import { css, cx } from "styled-system/css"
import { grid } from "styled-system/patterns"
import { type Merge } from "~/helpers/types"

export function Spinner({
	size,
	className,
	style,
	...props
}: Merge<ComponentPropsWithoutRef<"div">, { size: 5 | 8 | 12 }>) {
	return (
		<div
			{...props}
			className={cx(
				grid({ columns: 2, gap: "10%", animation: "spin", mx: "auto" }),
				className,
			)}
			style={{ width: `${size / 4}rem`, height: `${size / 4}rem`, ...style }}
		>
			<div className={css({ h: "full", rounded: "full", bg: "accent.300" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.400" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.400" })} />
			<div className={css({ h: "full", rounded: "full", bg: "accent.300" })} />
		</div>
	)
}
