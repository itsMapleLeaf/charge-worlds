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
    animation: {
      keyframes: {
        "zoom-fade-in": `{
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }`,
        "zoom-fade-out": `{
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }`,
      },
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
        "grid-template-columns": `repeat(auto-fill, minmax(${
          Number(cols) / 4
        }rem, 1fr))`,
      }),
      { autocomplete: "fluid-cols-<num>" },
    ],
  ],

  shortcuts: {
    ":uno:": "", // no-op so uno doesn't complain

    "s-full": "w-full h-full",

    "panel":
      ":uno: border border-white/10 rounded-md bg-black/75 shadow-black/25 shadow-md backdrop-blur-md [.panel_&]:(bg-transparent shadow-none backdrop-blur-none)",

    "interactive-panel":
      ":uno: transition active:(translate-y-0.5 shadow-none duration-0) panel [&.active,&:hover]:(border-accent-300/40 text-accent-300)",

    "button":
      ":uno: h-12 inline-flex items-center gap-2 px-3 leading-none interactive-panel [&>svg]:s-5",

    "anchor": ":uno: transition hover:text-accent-300",
    "anchor-underline": ":uno: underline anchor hover:no-underline",

    "input":
      ":uno: block h-12 w-full px-3 leading-none ring-2 ring-transparent transition panel",

    "textarea": ":uno: input py-3 leading-normal",

    "radix-transition":
      "data-[state=closed]:(animate-zoom-fade-out animate-duration-150 animate-ease) data-[state=open]:(animate-zoom-fade-in animate-duration-150 animate-ease)",
  },
})
