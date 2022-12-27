const plugin = require("tailwindcss/plugin")
const colors = require("tailwindcss/colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["RubikVariable", "sans-serif"],
      },
      colors: {
        accent: colors.rose,
      },
    },
  },
  plugins: [
    // adds `s-` utilities to define width and height,
    // based on the widths defined in the theme
    plugin(function sizePlugin({ matchUtilities, addUtilities, theme, e }) {
      matchUtilities(
        {
          s: (value) => ({ width: value, height: value }),
        },
        {
          values: theme("width"),
        },
      )
    }),

    // applies a thin white scrollbar to all elements
    plugin(function thinScrollbarPlugin({ addBase, theme }) {
      addBase({
        "::-webkit-scrollbar": {
          width: theme("spacing.2"),
          height: theme("spacing.2"),
        },
        "::-webkit-scrollbar-track, ::-webkit-scrollbar-corner": {
          backgroundColor: "transparent",
        },
        "::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        },
      })
    }),
  ],
}
