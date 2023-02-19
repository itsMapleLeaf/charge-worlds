import { formatDistanceToNow } from "date-fns"

export function RelativeTimestamp({
  date,
  ...options
}: {
  date: Date | string | number
  includeSeconds?: boolean
  addSuffix?: boolean
  locale?: Locale
}) {
  return (
    <time
      dateTime={typeof date === "string" ? date : new Date(date).toISOString()}
    >
      {formatDistanceToNow(new Date(date), options)}
    </time>
  )
}
