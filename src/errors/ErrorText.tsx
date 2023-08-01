import { type ComponentPropsWithoutRef } from "react"
import { css, cx } from "styled-system/css"

export function ErrorText(props: ComponentPropsWithoutRef<"p">) {
	return (
		<p
			{...props}
			className={cx(
				css({ color: "error.300", whiteSpace: "pre-wrap" }),
				props.className,
			)}
		/>
	)
}
