import { defineConfig, defineGlobalStyles } from "@pandacss/dev"
import { preset } from "@pandacss/preset-panda"
import { type Token } from "styled-system/types/composition"
import { type CssProperties } from "styled-system/types/system-types"

const transitions: Record<string, { in: CssProperties; out: CssProperties }> = {
	"fade-rise": {
		in: { transform: "translateY(0)", opacity: 1 },
		out: { transform: "translateY(0.5rem)", opacity: 0 },
	},
	fade: {
		in: { opacity: 1 },
		out: { opacity: 0 },
	},
}

const animations: Record<string, Token<string>> = {}
const keyframes: Record<string, { from: CssProperties; to: CssProperties }> = {}

for (const [name, transition] of Object.entries(transitions)) {
	animations[`${name}-in`] = { value: `${name}-in 150ms ease-out forwards` }
	animations[`${name}-out`] = { value: `${name}-out 150ms ease-in forwards` }
	keyframes[`${name}-in`] = { from: transition.out, to: transition.in }
	keyframes[`${name}-out`] = { from: transition.in, to: transition.out }
}

export default defineConfig({
	preflight: true,
	outExtension: "js",
	include: ["./src/**/*.{ts,tsx,js,jsx}"],
	exclude: [],
	outdir: "styled-system",

	theme: {
		extend: {
			tokens: {
				colors: {
					base: preset.theme.tokens.colors.neutral,
					accent: preset.theme.tokens.colors.indigo,
					error: preset.theme.tokens.colors.red,
				},
				fonts: {
					sans: { value: `"Spline Sans Variable", sans-serif` },
				},
				animations,
			},
			keyframes,
		},
	},

	globalCss: defineGlobalStyles({
		":root": {
			bg: "base.900",
			color: "blue.50",
			fontFamily: "sans",
			wordWrap: "break-word",
			overflowWrap: "break-word",
		},
		"*": {
			borderStyle: "solid",
			animationDuration: "150ms",
		},
		button: {
			cursor: "pointer",
			color: "inherit",
		},
		"input, select, textarea": {
			background: "transparent",
			color: "inherit",
		},
	}),
})
