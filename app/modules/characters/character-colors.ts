import { cx } from "class-variance-authority"

export type CharacterColorClasses = {
  background: string
  border: string
}

export const defaultCharacterColor = {
  background: cx("bg-black/75"),
  border: cx("border-white/25"),
}

export const characterColors: Record<string, CharacterColorClasses> = {
  neutral: defaultCharacterColor,

  red: {
    background: cx("bg-radix-redDark-red1/75"),
    border: cx("border-radix-redDark-red10/25"),
  },

  orange: {
    background: cx("bg-radix-orangeDark-orange1/75"),
    border: cx("border-radix-orangeDark-orange10/25"),
  },

  dandelion: {
    background: cx("bg-radix-yellowDark-yellow1/75"),
    border: cx("border-radix-yellowDark-yellow10/25"),
  },

  lime: {
    background: cx("bg-radix-grassDark-grass1/75"),
    border: cx("border-radix-grassDark-grass10/25"),
  },

  ocean: {
    background: cx("bg-radix-skyDark-sky1/75"),
    border: cx("border-radix-skyDark-sky10/25"),
  },

  blue: {
    background: cx("bg-radix-blueDark-blue1/75"),
    border: cx("border-radix-blueDark-blue10/25"),
  },

  violet: {
    background: cx("bg-radix-violetDark-violet1/75"),
    border: cx("border-radix-violetDark-violet10/25"),
  },

  pink: {
    background: cx("bg-radix-pinkDark-pink1/75"),
    border: cx("border-radix-pinkDark-pink10/25"),
  },
}
