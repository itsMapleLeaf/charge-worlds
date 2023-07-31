export function assert(
  input: unknown,
  message = "Assertion failed",
): asserts input {
  if (!input) {
    throw new Error(message)
  }
}
