import type { ReactNode } from "react"

export function ControlsOverlay(props: {
  children: ReactNode
  controls: ReactNode
}) {
  return (
    <div className="group relative h-max">
      {props.children}
      <div className="absolute right-0 top-0 p-3 opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
        {props.controls}
      </div>
    </div>
  )
}
