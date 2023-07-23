export function countWhere<T>(array: T[], predicate: (item: T) => boolean) {
  return array.reduce((count, item) => (predicate(item) ? count + 1 : count), 0)
}
