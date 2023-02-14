import clsx from "clsx"
import { X } from "lucide-react"
import { useEffect, useRef } from "react"
import { Counter } from "./counter"
import { activePressClass } from "./styles"

const positiveMod = (n: number, m: number) => ((n % m) + m) % m

export function ClockInput({
  name,
  progress,
  maxProgress,
  onNameChange,
  onProgressChange,
  onMaxProgressChange,
  onRemove,
}: {
  name: string
  progress: number
  maxProgress: number
  onNameChange?: (name: string) => void
  onProgressChange: (progress: number) => void
  onMaxProgressChange?: (maxProgress: number) => void
  onRemove?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerDownRef = useRef(false)
  const lastSliceInput = useRef<number>()

  const updateFilledSlices = (
    event: React.PointerEvent,
    { toggleSlice = false } = {},
  ) => {
    const { offsetX, offsetY } = event.nativeEvent
    const { width, height } = canvasRef.current!

    const x = offsetX - width / 2
    const y = offsetY - height / 2

    const angle = positiveMod(Math.atan2(y, x) + Math.PI / 2, Math.PI * 2)

    let progressInput = Math.ceil((angle / (Math.PI * 2)) * maxProgress)

    // to ensure we can't turn off a slice
    // then immediately turn it back on when dragging a pixel
    if (progressInput === lastSliceInput.current) return
    lastSliceInput.current = progressInput

    // the slice being < 0 means we actually filled the chart, due to atan2 math
    if (progressInput <= 0) {
      progressInput += maxProgress
    }

    // need to be able to turn the current slice off
    if (progressInput === progress && toggleSlice) {
      progressInput -= 1
    }

    onProgressChange(progressInput)
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext("2d")!

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const lineWidth = 1
    const angleTop = -Math.PI / 2
    const tau = Math.PI * 2
    const color = getComputedStyle(canvas).color

    context.clearRect(0, 0, canvas.width, canvas.height)

    // filled arc
    context.save()
    context.fillStyle = color
    context.globalAlpha = 0.5
    context.beginPath()
    context.arc(
      centerX,
      centerY,
      centerX - lineWidth / 2,
      angleTop,
      angleTop + (tau * progress) / maxProgress,
      false,
    )
    context.lineTo(centerX, centerY)
    context.fill()
    context.restore()

    // outer border
    context.save()
    context.strokeStyle = color
    context.lineWidth = lineWidth
    context.globalAlpha = 0.75
    context.beginPath()
    context.arc(centerX, centerY, centerX - lineWidth, 0, 2 * Math.PI)
    context.stroke()
    context.restore()

    // segments going from inside to outside
    if (maxProgress > 1) {
      context.save()
      context.globalAlpha = 0.75
      context.strokeStyle = color
      context.lineWidth = lineWidth

      for (let i = 0; i < maxProgress; i++) {
        context.beginPath()
        context.moveTo(centerX, centerY)
        context.lineTo(
          centerX +
            (centerX - lineWidth) *
              Math.cos(angleTop + (tau * i) / maxProgress),
          centerY +
            (centerY - lineWidth) *
              Math.sin(angleTop + (tau * i) / maxProgress),
        )
        context.stroke()
      }
      context.restore()
    }
  })

  return (
    <div className="group relative flex flex-col items-center justify-center gap-3 text-center">
      {onNameChange ? (
        <input
          className="-my-2 w-full rounded-md bg-transparent p-2 text-center text-xl leading-tight tracking-wide transition hover:bg-black/25 focus:bg-black/25 focus:outline-none"
          placeholder="Clock name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      ) : (
        <h3 className="text-xl leading-tight tracking-wide">{name}</h3>
      )}
      <p className="sr-only">
        Progress: {progress} / {maxProgress}
      </p>
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        draggable={false}
        // eslint-disable-next-line react/no-unknown-property
        onPointerDown={(event) => {
          pointerDownRef.current = true
          lastSliceInput.current = undefined
          updateFilledSlices(event, { toggleSlice: true })

          window.addEventListener(
            "pointerup",
            () => {
              pointerDownRef.current = false
            },
            { once: true },
          )
        }}
        // eslint-disable-next-line react/no-unknown-property
        onPointerMove={(event) => {
          if (pointerDownRef.current) updateFilledSlices(event)
        }}
        className="cursor-pointer select-none opacity-75 transition-opacity hover:opacity-100"
      />

      {onMaxProgressChange && (
        <Counter value={maxProgress} min={2} onChange={onMaxProgressChange} />
      )}

      {onRemove && (
        <button
          className={clsx(
            "absolute top-0 right-0 rounded-md p-2 opacity-0 ring-blue-500 transition focus:opacity-75 focus:outline-none focus:ring-2 group-hover:opacity-75",
            activePressClass,
          )}
          type="button"
          title="Remove clock"
          onClick={onRemove}
        >
          <X />
        </button>
      )}
    </div>
  )
}
