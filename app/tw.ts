/** no-op tagged template function for editor autocomplete */
export const tw = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const result: string[] = []
  for (const [i, string] of strings.entries()) {
    result.push(string)
    if (i < values.length) {
      result.push(String(values[i]))
    }
  }
  return result.join("")
}
