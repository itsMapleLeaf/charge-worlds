export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const clamp = (value: number, min: number, max: number) =>
  value < min ? min : value > max ? max : value
