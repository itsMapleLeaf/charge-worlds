import type { ValueOf } from "./types"

export function mapValues<T extends object, Output>(
  object: T,
  fn: (input: ValueOf<T>, key: keyof T) => Output,
) {
  const result = {} as Record<keyof T, Output>
  for (const key of Object.keys(object) as Array<keyof T>) {
    result[key] = fn(object[key], key)
  }
  return result
}
