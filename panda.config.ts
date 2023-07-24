import { defineConfig, defineGlobalStyles } from "@pandacss/dev"
import { preset } from "@pandacss/preset-panda"

const fadeRiseEnter = { transform: "translateY(0)", opacity: 1 }
const fadeRiseExit = { transform: "translateY(0.5rem)", opacity: 0 }

const fadeRiseKeyframes = {
  fadeRiseIn: { from: fadeRiseExit, to: fadeRiseEnter },
  fadeRiseOut: { from: fadeRiseEnter, to: fadeRiseExit },
}

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // The extension for the emitted JavaScript files
  outExtension: "js",
  // Where to look for your css declarations
  include: ["./app/**/*.{ts,tsx,js,jsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
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

  // The output directory for your css system
  outdir: "styled-system",

  globalCss: defineGlobalStyles({
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
})
