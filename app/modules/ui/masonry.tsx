import type { Key, ReactNode } from "react"
import { Fragment } from "react"
import { range } from "~/helpers/range"
import { useSize } from "~/helpers/use-size"

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
  renderItem: (item: T, index: number) => ReactNode
}) {
  const [sizeRef, size] = useSize()
  const columnCount = Math.floor(size.width / columnWidth)

  return (
    <div ref={sizeRef} className="flex" style={{ gap }}>
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
