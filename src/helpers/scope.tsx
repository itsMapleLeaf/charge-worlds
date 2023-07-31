export function Scope({ children }: { children: () => React.ReactNode }) {
  return <>{children()}</>
}
