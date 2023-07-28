import { LucideUser } from "lucide-react"
import { type ReactNode } from "react"
import { css } from "styled-system/css"
import { center } from "styled-system/patterns"

export function Avatar({ src }: { src: string | null | undefined }): ReactNode {
  return src ? (
    <img src={src} alt="" className={css({ w: 8, h: 8, rounded: "full" })} />
  ) : (
    <div
      className={center({
        w: 8,
        h: 8,
        rounded: "full",
        borderColor: "neutral.700",
      })}
    >
      <LucideUser />
    </div>
  )
}
