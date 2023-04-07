export function groupBy<T, C extends PropertyKey>(
  list: readonly T[],
  key: (item: T) => C,
) {
  const groups: { [_ in C]?: T[] } = {}
  for (const item of list) {
    const groupKey = key(item)
    const items = (groups[groupKey] ??= [])
    items.push(item)
  }
  return groups
}
