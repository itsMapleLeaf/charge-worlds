import { assert } from "./assert"

export function parseKeys<T extends object, K extends Extract<keyof T, string>>(
  object: T,
  keys: K[],
): { [k in K]: NonNullable<T[k]> } {
  for (const key of keys) {
    assert(object[key] != null, `Missing key ${key}`)
  }
  return object as { [k in K]: NonNullable<T[k]> }
}
