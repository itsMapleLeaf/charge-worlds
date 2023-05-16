import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gray: colors.neutral,
        accent: colors.indigo,
      },
      fontFamily: {
        sans: `RubikVariable, sans-serif`,
      },
    },
  },
  corePlugins: { container: false },
  plugins: [
    plugin(function customStyles(api) {
      // adds s-* classes to set width and height
      api.matchUtilities(
        { s: (value: string) => ({ width: value, height: value }) },
        { values: api.theme("width") },
      )

      // adds fluid-cols-<colwidth> for fluid columns with css grid
      // and fluid-cols-auto-fit + fluid-cols-auto-fill to customize the repeat behavior
      const fluidColsRepeatVar = "--fluid-cols-repeat"
      api.addBase({
        ":root": {
          [fluidColsRepeatVar]: "auto-fill",
        },
      })
      api.matchUtilities(
        {
          "fluid-cols": (value: string) => ({
            "grid-template-columns": `repeat(var(${fluidColsRepeatVar}), minmax(${value}, 1fr))`,
          }),
        },
        { values: api.theme("width") },
      )
      api.addUtilities({
        ".fluid-cols-auto-fit": { [fluidColsRepeatVar]: "auto-fit" },
        ".fluid-cols-auto-fill": { [fluidColsRepeatVar]: "auto-fill" },
      })

      // fancy mode variant
      api.addVariant("fancy", "[data-fancy-mode] &")
    }),
  ],
} satisfies Config
