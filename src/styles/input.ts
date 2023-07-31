import { cva } from "styled-system/css"

export const input = cva({
	base: {
		minW: 0,
		w: "full",
		bg: "base.700",
		borderWidth: 1,
		borderColor: "base.600",
		rounded: "md",
		px: 3,
		h: 10,
	},
})
