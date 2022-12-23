import { formatDistanceToNow } from "date-fns"
import { Tooltip } from "./tooltip"

export function RelativeTimestamp({
  date,
  ...options
}: {
  date: number | Date
  includeSeconds?: boolean
  addSuffix?: boolean
}) {
  return (
    <Tooltip text={new Date(date).toLocaleString()} inline>
      <time dateTime={new Date(date).toISOString()}>
        {formatDistanceToNow(date, options)}
      </time>
    </Tooltip>
  )
}
