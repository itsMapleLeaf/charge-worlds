import { EmptyState } from "~/ui/empty-state"

export function NotFoundMessage() {
  return (
    <EmptyState title="404">
      <p>Couldn't find what you were looking for.</p>
    </EmptyState>
  )
}
