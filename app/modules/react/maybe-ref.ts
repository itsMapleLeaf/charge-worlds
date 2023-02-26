export type MaybeRef<T> = T | React.RefObject<T> | React.MutableRefObject<T>

export const extractRef = <T>(
  ref: MaybeRef<T> | null | undefined,
): T | null | undefined =>
  typeof ref === "object" && ref !== null && "current" in ref
    ? ref.current
    : ref
