import { defineConfig, defineGlobalStyles } from "@pandacss/dev"
import { preset } from "@pandacss/preset-panda"

const fadeRiseEnter = { transform: "translateY(0)", opacity: 1 }
const fadeRiseExit = { transform: "translateY(0.5rem)", opacity: 0 }

const fadeRiseKeyframes = {
	fadeRiseIn: { from: fadeRiseExit, to: fadeRiseEnter },
	fadeRiseOut: { from: fadeRiseEnter, to: fadeRiseExit },
}

export default defineConfig({
	preflight: true,
	outExtension: "js",
	include: ["./src/**/*.{ts,tsx,js,jsx}"],
	exclude: [],
	outdir: "styled-system",

	globalCss: defineGlobalStyles({
		":root": {
			bg: "base.900",
			color: "blue.50",
			fontFamily: "sans",
		},
		"*": {
			borderStyle: "solid",
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

	theme: {
		extend: {
			tokens: {
				colors: {
					base: preset.theme.tokens.colors.neutral,
					accent: preset.theme.tokens.colors.indigo,
				},
				fonts: {
					sans: { value: `"Spline Sans Variable", sans-serif` },
				},
			},
			keyframes: fadeRiseKeyframes,
		},
	},
})
