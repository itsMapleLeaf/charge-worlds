export function toError(error: unknown) {
  if (error instanceof Error) return error
  return new Error(String(error))
}

export function raise(value: unknown): never {
  throw typeof value === "string" ? new Error(value) : value
}
