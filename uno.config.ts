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

  variants: [
    (matcher) => {
      if (!matcher.startsWith("fancy:")) return matcher
      return {
        matcher: matcher.slice(6),
        selector: (s) => `[data-fancy-mode] ${s}`,
      }
    },
  ],

  shortcuts: {
    ":uno:": "", // no-op so uno doesn't complain

    "s-full": "w-full h-full",

    "container": ":uno: mx-auto w-full max-w-screen-md px-4",

    "panel":
      ":uno: border border-white/20 fancy:(border-white/10 bg-black/75 shadow-black/25 shadow-md backdrop-blur-md) rounded-md bg-black [.panel_&]:(shadow-none backdrop-blur-none bg-transparent)",

    "interactive-panel":
      ":uno: fancy:transition active:(scale-95 shadow-none duration-0!) panel [&.active,&:hover]:(text-accent-300 border-accent-300/40!)",

    "button":
      ":uno: h-12 inline-flex items-center gap-2 px-3 leading-none [&>svg]:s-5 interactive-panel",

    "anchor": ":uno: transition hover:text-accent-300",
    "anchor-underline": ":uno: underline anchor hover:no-underline",

    "input":
      ":uno: block h-12 w-full px-3 leading-none ring-2 ring-transparent transition panel",

    "textarea": "input py-3 leading-normal",

    "checkbox":
      ":uno: inline cursor-pointer appearance-none s-4 border-white/25! rounded-sm! checked:bg-accent interactive-panel",

    "label": "text-sm font-medium leading-none",

    "radix-zoom-fade-transition":
      "data-[state=closed]:(animate-zoom-fade-out animate-duration-150 animate-ease animate-fill-forwards) data-[state=open]:(animate-zoom-fade-in animate-duration-150 animate-ease animate-fill-forwards)",
  },
})
