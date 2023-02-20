import type { Key, ReactElement } from "react"
import { Fragment, useRef, useState } from "react"
import { range } from "~/helpers/range"
import { useSizeCallback } from "~/helpers/use-size"

export function Masonry<T>({
  items,
  itemKey,
  columnWidth,
  gap,
  renderItem,
}: {
  items: T[]
  itemKey: (item: T) => Key
  columnWidth: number
  gap?: number | string
  renderItem: (item: T, index: number) => ReactElement
}) {
  const ref = useRef<HTMLDivElement>(null)

  const [columnCount, setColumnCount] = useState(0)
  useSizeCallback(ref, (width) => {
    setColumnCount(Math.floor(width / columnWidth))
  })

  return (
    <div ref={ref} className="flex" style={{ gap }}>
      {range(columnCount).map((columnIndex) => (
        <div key={columnIndex} className="flex flex-1 flex-col" style={{ gap }}>
          {range(columnIndex, items.length, columnCount).map((itemIndex) =>
            items[itemIndex] ? (
              <Fragment key={itemKey(items[itemIndex])}>
                {renderItem(items[itemIndex], itemIndex)}
              </Fragment>
            ) : null,
          )}
        </div>
      ))}
    </div>
  )
}
