import { LucideChevronLeft, LucideChevronRight } from "lucide-react"
import { useState } from "react"
import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"
import { input } from "~/styles/input"

export function Counter() {
	const [value, setValue] = useState(0)

	const buttonClass = css({
		p: 2,
		m: -2,
		transition: "common",
		_hover: { color: "accent.400" },
		_active: { color: "accent.300", transitionDuration: "0s" },
	})

	return (
		<div className={cx(input(), hstack({ gap: 1, justify: "center" }))}>
			<button
				type="button"
				className={buttonClass}
				onClick={() => setValue((v) => v - 1)}
			>
				<LucideChevronLeft />
			</button>
			<p
				className={css({
					fontVariantNumeric: "tabular-nums",
					minW: 6,
					textAlign: "center",
				})}
			>
				{value}
			</p>
			<button
				type="button"
				className={buttonClass}
				onClick={() => setValue((v) => v + 1)}
			>
				<LucideChevronRight />
			</button>
		</div>
	)
}
