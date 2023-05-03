import { MinusCircle, PlusCircle } from "lucide-react"
import { range } from "../../helpers/range"

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
        className="justify-center border-0 bg-transparent p-2 s-10 button"
        onClick={() => onChange(Math.max(value - 1, min))}
      >
        <MinusCircle />
      </button>

      <p className="min-w-[1rem] text-center leading-none tabular-nums">
        {value}
      </p>

      <button
        type="button"
        title="Add one"
        className="justify-center border-0 bg-transparent p-2 s-10 button"
        onClick={() => onChange(Math.min(value + 1, max))}
      >
        <PlusCircle />
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
          className="border-2 border-white/50 rounded-full transition s-5 active:scale-90 hover:border-accent data-[active]:bg-white active:duration-0 data-[active]:hover:bg-accent"
        />
      ))}
    </div>
  )
}
