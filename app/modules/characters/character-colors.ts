import * as colors from "@radix-ui/colors"

export type CharacterColorClasses = {
  background: string
  border: string
}

export const defaultCharacterColor = {
  background: "black",
  border: "white",
}

export const characterColors: Record<string, CharacterColorClasses> = {
  neutral: defaultCharacterColor,

  red: {
    background: colors.redDark.red1,
    border: colors.redDark.red10,
  },

  orange: {
    background: colors.orangeDark.orange1,
    border: colors.orangeDark.orange10,
  },

  dandelion: {
    background: colors.yellowDark.yellow1,
    border: colors.yellowDark.yellow10,
  },

  lime: {
    background: colors.grassDark.grass1,
    border: colors.grassDark.grass10,
  },

  ocean: {
    background: colors.skyDark.sky1,
    border: colors.skyDark.sky10,
  },

  blue: {
    background: colors.blueDark.blue1,
    border: colors.blueDark.blue10,
  },

  violet: {
    background: colors.violetDark.violet1,
    border: colors.violetDark.violet10,
  },

  pink: {
    background: colors.pinkDark.pink1,
    border: colors.pinkDark.pink10,
  },
}
