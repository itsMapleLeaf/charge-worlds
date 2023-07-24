import { hstack } from "styled-system/patterns"

export const button = () =>
  hstack({
    bg: "neutral.700",
    borderWidth: "1px",
    borderColor: "neutral.600",
    color: "white",
    transition: "common",
    px: "3",
    h: "10",
    fontWeight: "medium",
    rounded: "md",
    gap: "2.5",
    fontSize: "15px",
    transform: "translateY(0)",
    _hover: { bg: "neutral.600" },
    _active: {
      transitionDuration: "0s",
      transform: "translateY(2px)",
    },
    "& > svg": { w: "5", h: "5", mx: "-1" },
  })
