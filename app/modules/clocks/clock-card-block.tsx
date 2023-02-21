import { z } from "zod"
import { ClockInput as ClockInputComponent } from "../ui/clock-input"

export const clockSchema = z.object({
  name: z.string().default(""),
  progress: z.number().default(0),
  maxProgress: z.number().default(4),
})
export type ClockInput = z.input<typeof clockSchema>
export type ClockOutput = z.output<typeof clockSchema>

export function ClockCardBlock({
  data,
  onChange,
}: {
  data: ClockOutput
  onChange: (data: ClockInput) => void
}) {
  return (
    <div className="flex flex-col items-center p-2">
      <ClockInputComponent
        name={data.name}
        progress={data.progress}
        maxProgress={data.maxProgress}
        onNameChange={(name) => onChange({ ...data, name })}
        onProgressChange={(progress) => onChange({ ...data, progress })}
        onMaxProgressChange={(maxProgress) =>
          onChange({ ...data, maxProgress })
        }
      />
    </div>
  )
}
