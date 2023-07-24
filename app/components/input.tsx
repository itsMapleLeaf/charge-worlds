import { css } from "styled-system/css"

export function input() {
  return css({
    minW: 0,
    w: "full",
    bg: "base.700",
    borderWidth: 1,
    borderColor: "base.600",
    rounded: "md",
    px: 3,
    h: 10,
  })
}
