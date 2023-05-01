// @unocss-include
import { colors } from "@unocss/preset-mini/colors"
import { defineConfig, presetUno, transformerVariantGroup } from "unocss"

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerVariantGroup()],

  theme: {
    colors: {
      white: colors.white,
      black: colors.black,
      gray: colors.neutral,
      accent: colors.indigo,
    },
    fontFamily: {
      sans: `RubikVariable, sans-serif`,
    },
  },

  rules: [
    // `s-*` classes to set width and height
    [
      /^s-(\d+)$/,
      ([, size]) => ({
        width: `${Number(size) / 4}rem`,
        height: `${Number(size) / 4}rem`,
      }),
      { autocomplete: "s-<num>" },
    ],

    // `fluid-cols-<colwidth>` for fluid columns with css grid
    [
      /^fluid-cols-(\d+)$/,
      ([, cols]) => ({
        "grid-template-columns": `repeat(auto-fit, minmax(${
          Number(cols) / 4
        }rem, 1fr))`,
      }),
      { autocomplete: "fluid-cols-<num>" },
    ],
  ],

  shortcuts: {
    ":uno:": "", // no-op so uno doesn't complain
    "panel":
      ":uno: border border-white/10 rounded-md bg-black/75 shadow-black/25 shadow-md backdrop-blur-md",
    "interactive-panel":
      ":uno: panel transition hover:(border-indigo-300/40 text-indigo-300)",
    "button":
      ":uno: h-12 inline-flex items-center gap-2 px-3 leading-none interactive-panel [&>svg]:s-5",
    "anchor": ":uno: transition hover:text-indigo-300",
    "anchor-underline": ":uno: anchor underline hover:no-underline",
  },
})
