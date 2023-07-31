export function parseUnsignedInteger(input: unknown) {
  const value = Number(input)
  if (Number.isInteger(value) && value >= 0) return value
  throw new Error("Must be an unsigned integer")
}
