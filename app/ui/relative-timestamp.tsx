import { formatDistanceToNow } from "date-fns"

export function RelativeTimestamp({
  date,
  ...options
}: {
  date: number | Date
  includeSeconds?: boolean
  addSuffix?: boolean
}) {
  return (
    <time dateTime={new Date(date).toISOString()}>
      {formatDistanceToNow(date, options)}
    </time>
  )
}
