import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import * as React from "react"

const maxHeight = 360

export function Expandable({ children }: { children: React.ReactNode }) {
  const innerContainerRef = React.useRef<HTMLDivElement>(null)
  const [innerHeight, setInnerHeight] = React.useState(0)

  React.useLayoutEffect(() => {
    if (!innerContainerRef.current) return
    setInnerHeight(innerContainerRef.current.clientHeight)
  }, [])

  React.useEffect(() => {
    if (!innerContainerRef.current) return
    const observer = new ResizeObserver(([info]) => {
      if (!info) throw new Error("ResizeObserver info not found")
      setInnerHeight(info.contentRect.height)
    })
    observer.observe(innerContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="isolate">
      <motion.div
        animate={{
          height: expanded ? "auto" : maxHeight,
        }}
        style={{ maxHeight: innerHeight }}
      >
        <div ref={innerContainerRef}>{children}</div>
      </motion.div>
      {innerHeight > maxHeight && (
        <button
          className="hover:text-foreground-8 relative z-10 flex w-full flex-row items-center justify-center gap-2 border-t border-white/10 bg-black p-2 text-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
          <ChevronDown
            data-expanded={expanded || undefined}
            className="transition-transform s-5 data-[expanded]:rotate-180"
          />
        </button>
      )}
    </div>
  )
}
