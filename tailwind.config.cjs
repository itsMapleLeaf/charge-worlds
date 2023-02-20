const plugin = require("tailwindcss/plugin")
const colors = require("@radix-ui/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neutral: Object.fromEntries(
          Object.entries(colors.violetDark).map(([key, value]) => [
            key.replace("violet", ""),
            value,
          ]),
        ),
        foreground: Object.fromEntries(
          Object.entries(colors.violet).map(([key, value]) => [
            key.replace("violet", ""),
            value,
          ]),
        ),
        radix: colors,
      },
      fontFamily: {
        body: ["RubikVariable", "sans-serif"],
      },
      minHeight: (utils) => ({
        ...utils.theme("width"),
      }),
    },
  },
  plugins: [
    // @ts-expect-error
    require("@tailwindcss/container-queries"),

    plugin(function thinScrollbar({ addComponents, theme }) {
      addComponents({
        ".thin-scrollbar": {
          "&::-webkit-scrollbar": {
            width: theme("width.1"),
            height: theme("width.1"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
            borderRadius: theme("borderRadius.full"),
          },
          "&::-webkit-scrollbar-track-piece:start, &::-webkit-scrollbar-track-piece:end, &::-webkit-scrollbar-corner":
            {
              backgroundColor: theme("colors.transparent"),
            },
        },
      })
    }),

    // adds a can-hover: variant, which applies if the device has pointer hovering capabilities
    plugin(function canHover({ addVariant }) {
      addVariant("can-hover", "@media (hover: hover)")
    }),

    // adds fluid-cols-* which applies the class `grid-template-columns: repeat(auto-fill, minmax(*, 1fr))`
    // also fluid-cols-[auto-fill/auto-fit] to adjust the behavior
    plugin(function fluidCols(api) {
      api.matchUtilities(
        {
          "fluid-cols": (value) => ({
            "--tw-fluid-cols": "auto-fill",
            "grid-template-columns": `repeat(var(--tw-fluid-cols), minmax(${value}, 1fr))`,
          }),
        },
        {
          values: api.theme("width"),
        },
      )

      api.addUtilities({
        ".fluid-cols-auto-fill": {
          "--tw-fluid-cols": "auto-fill",
        },
        ".fluid-cols-auto-fit": {
          "--tw-fluid-cols": "auto-fit",
        },
      })
    }),

    // adds s-* utilities to apply both width and height
    plugin(function size(api) {
      api.matchUtilities(
        { s: (value) => ({ width: value, height: value }) },
        { values: api.theme("width") },
      )
    }),
  ],
}
