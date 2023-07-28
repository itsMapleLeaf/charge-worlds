import type { RecipeVariantProps } from "styled-system/css"
import { cva } from "styled-system/css"

export const button = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,

    bg: "base.700",
    color: "white",

    borderWidth: "1px",
    borderColor: "base.600",

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
    shape: "default",
    align: "center",
  },
})

export const circleButton = (props?: RecipeVariantProps<typeof button>) =>
  button({ shape: "circle", ...props })
