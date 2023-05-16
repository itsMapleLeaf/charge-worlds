import { MinusCircle, PlusCircle } from "lucide-react"
import { range } from "../helpers/range"

export function Counter({
  value,
  min = 0,
  max = Number.POSITIVE_INFINITY,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        title="Subtract one"
        className="interactive flex items-center justify-center s-8"
        onClick={() => onChange(Math.max(value - 1, min))}
      >
        <MinusCircle className="s-5" />
      </button>

      <p className="min-w-[1rem] text-center tabular-nums leading-none">
        {value}
      </p>

      <button
        type="button"
        title="Add one"
        className="interactive flex items-center justify-center s-8"
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        <PlusCircle className="s-5" />
      </button>
    </div>
  )
}

export function DotCounter({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      {range(1, max + 1).map((n) => (
        <button
          key={n}
          type="button"
          title={value === n ? `Set to ${n - 1}` : `Set to ${n}`}
          onClick={() => onChange(value === n ? n - 1 : n)}
          data-active={n <= value || undefined}
          className="hover:border-accent data-[active]:hover:bg-accent rounded-full border-2 border-white/50 transition s-5 active:scale-90 active:duration-0 data-[active]:bg-white"
        />
      ))}
    </div>
  )
}
