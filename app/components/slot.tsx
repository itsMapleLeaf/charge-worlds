import {
  Children,
  type ReactElement,
  type ReactNode,
  cloneElement,
} from "react"

export function Slot({ children, ...props }: { children?: ReactNode }) {
  return cloneElement(Children.only(children as ReactElement), props)
}
