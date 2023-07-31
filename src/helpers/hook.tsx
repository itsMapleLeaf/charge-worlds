export function Hook<T>({
  fn: useHook,
  children,
}: {
  fn: () => T
  children: (value: T) => React.ReactNode
}) {
  return <>{children(useHook())}</>
}
