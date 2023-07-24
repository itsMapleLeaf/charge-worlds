import { css, cx } from "styled-system/css"
import { hstack } from "styled-system/patterns"

const buttonBase = () =>
  hstack({
    bg: "base.700",
    borderWidth: "1px",
    borderColor: "base.600",
    color: "white",
    transition: "common",
    fontWeight: "medium",
    gap: 2.5,
    justifyContent: "center",
    fontSize: "15px",
    transform: "translateY(0)",
    _hover: { bg: "base.600" },
    _active: {
      transitionDuration: "0s",
      transform: "translateY(2px)",
    },
  })

export const button = () =>
  cx(
    buttonBase(),
    css({
      px: 3,
      h: 10,
      rounded: "md",
      "& > svg": { w: 5, h: 5, mx: -1 },
    }),
  )

export const circleButton = () =>
  cx(
    buttonBase(),
    css({
      rounded: "full",
      w: 12,
      h: 12,
      "& > svg": { w: 6, h: 6 },
    }),
  )
