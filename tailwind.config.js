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
    plugin(function sizePlugin({ addUtilities, theme, e }) {
      const sizes = theme("width")
      const utilities = Object.entries(sizes).map(([key, value]) => ({
        [`.s-${e(key)}`]: {
          width: value,
          height: value,
        },
      }))
      addUtilities(utilities)
    }),
  ],
}
