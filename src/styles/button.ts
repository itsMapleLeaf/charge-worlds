import type { RecipeVariantProps } from "styled-system/css"
import { cva } from "styled-system/css"

export const button = cva({
	base: {
		display: "inline-flex",
		alignItems: "center",

		color: "white",

		transition: "common",

		fontWeight: "medium",
		fontSize: "15px",

		transform: "translateY(0)",

		_hover: {
			bg: "base.600",
		},

		_active: {
			transitionDuration: "0s",
			transform: "translateY(2px)",
		},
	},
	variants: {
		variant: {
			solid: {
				bg: { base: "base.700", _hover: "base.600" },
				borderWidth: "1px",
				borderColor: "base.600",
				px: 3,
				h: 10,
				rounded: "md",
				gap: 2.5,
				"& > svg": { w: 5, h: 5, mx: -1 },
			},
			circle: {
				bg: { base: "base.700", _hover: "base.600" },
				borderWidth: "1px",
				borderColor: "base.600",
				rounded: "full",
				w: 12,
				h: 12,
				"& > svg": { w: 6, h: 6 },
			},
			ghost: {
				p: 2,
				m: -2,
				gap: 2,
				rounded: "md",
				lineHeight: 1,
				"& > svg": { w: 5, h: 5 },
				bg: { _hover: "rgba(255 255 255 / 0.2)" },
			},
		},
		align: {
			start: { justifyContent: "flex-start" },
			center: { justifyContent: "center" },
			end: { justifyContent: "flex-end" },
		},
	},
	defaultVariants: {
		variant: "solid",
		align: "center",
	},
})

export const circleButton = (props?: RecipeVariantProps<typeof button>) =>
	button({ variant: "circle", ...props })
