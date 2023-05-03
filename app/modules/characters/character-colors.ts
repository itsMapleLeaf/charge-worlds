import * as colors from "@radix-ui/colors"
import { rgba } from "polished"

export type CharacterColorClasses = {
  background: string
  border: string
}

export const defaultCharacterColor = {
  background: rgba("black", 0.75),
  border: rgba("white", 0.1),
}

export const characterColors: Record<string, CharacterColorClasses> = {
  neutral: defaultCharacterColor,

  red: {
    background: rgba(colors.redDark.red1, 0.75),
    border: rgba(colors.redDark.red10, 0.25),
  },

  orange: {
    background: rgba(colors.orangeDark.orange1, 0.75),
    border: rgba(colors.orangeDark.orange10, 0.25),
  },

  dandelion: {
    background: rgba(colors.yellowDark.yellow1, 0.75),
    border: rgba(colors.yellowDark.yellow10, 0.25),
  },

  lime: {
    background: rgba(colors.grassDark.grass1, 0.75),
    border: rgba(colors.grassDark.grass10, 0.25),
  },

  ocean: {
    background: rgba(colors.skyDark.sky1, 0.75),
    border: rgba(colors.skyDark.sky10, 0.25),
  },

  blue: {
    background: rgba(colors.blueDark.blue1, 0.75),
    border: rgba(colors.blueDark.blue10, 0.25),
  },

  violet: {
    background: rgba(colors.violetDark.violet1, 0.75),
    border: rgba(colors.violetDark.violet10, 0.25),
  },

  pink: {
    background: rgba(colors.pinkDark.pink1, 0.75),
    border: rgba(colors.pinkDark.pink10, 0.25),
  },
}
