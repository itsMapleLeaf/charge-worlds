import type { RecipeVariantProps } from "styled-system/css"
import { cva } from "styled-system/css"

export const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2.5,

    color: "white",

    transition: "common",

    fontWeight: "medium",
    fontSize: "15px",

    transform: "translateY(0)",

    _hover: {
      bg: "base.600",
    },

    _active: {
      transitionDuration: "0s",
      transform: "translateY(2px)",
    },
  },
  variants: {
    appearance: {
      solid: {
        bg: { base: "base.700", _hover: "base.600" },
        borderWidth: "1px",
        borderColor: "base.600",
      },
      ghost: {
        bg: { _hover: "base.600" },
      },
    },
    shape: {
      default: {
        px: 3,
        h: 10,
        rounded: "md",
        "& > svg": { w: 5, h: 5, mx: -1 },
      },
      circle: {
        rounded: "full",
        w: 12,
        h: 12,
        "& > svg": { w: 6, h: 6 },
      },
    },
    align: {
      start: { justifyContent: "flex-start" },
      center: { justifyContent: "center" },
      end: { justifyContent: "flex-end" },
    },
  },
  defaultVariants: {
    appearance: "solid",
    shape: "default",
    align: "center",
  },
})

export const circleButton = (props?: RecipeVariantProps<typeof button>) =>
  button({ shape: "circle", ...props })
