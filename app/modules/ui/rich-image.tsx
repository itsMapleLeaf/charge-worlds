import * as Dialog from "@radix-ui/react-dialog"
import * as lucide from "lucide-react"
import * as React from "react"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { loadImage } from "~/helpers/load-image"
import { clamp, lerp } from "~/helpers/math"
import {
  createSuspenseResource,
  type SuspenseResource,
} from "~/helpers/suspense-resource"
import { type Nullish } from "~/helpers/types"
import { useAnimationLoop } from "~/helpers/use-animation-loop"
import { useWindowEvent } from "~/helpers/use-window-event"
import { raise } from "../../helpers/errors"
import { extractRef, type MaybeRef } from "../react/maybe-ref"
import { LoadingSpinner } from "./loading"
import { SuspenseImage } from "./suspense-image"

function createIsomorphicImageResource(src: string) {
  if (typeof window === "undefined") {
    return createSuspenseResource(src)
  }
  return createSuspenseResource(loadImage(src).then((img) => img.src))
}

export function RichImage(props: { src: Nullish<string> }) {
  const imageResource = React.useMemo(() => {
    if (!props.src) return
    return createIsomorphicImageResource(props.src)
  }, [props.src])

  if (!imageResource) {
    return <ContentState text="No image provided" icon={lucide.ImageOff} />
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="s-full relative flex items-center justify-center"
        title="Show large preview"
      >
        <ErrorBoundary
          fallback={
            <ContentState text="Image failed to load" icon={lucide.ImageOff} />
          }
          resetKeys={[props.src]}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <SuspenseImage
              resource={imageResource}
              alt=""
              className="s-full absolute inset-0 object-cover"
            />
            <SuspenseImage
              resource={imageResource}
              alt=""
              className="s-full absolute inset-0 object-contain backdrop-blur-md backdrop-brightness-50"
            />
          </Suspense>
        </ErrorBoundary>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in animate-duration-150! animate-ease!">
          <ErrorBoundary
            fallback={
              <ContentState
                text="Image failed to load"
                icon={lucide.ImageOff}
              />
            }
            resetKeys={[props.src]}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <LargePreview resource={imageResource} />
            </Suspense>
          </ErrorBoundary>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ContentState(props: { text: string; icon: lucide.LucideIcon }) {
  return (
    <div className="s-full flex flex-col items-center justify-center gap-3 p-4">
      <props.icon className="opacity-25 s-24" aria-hidden />
      <p className="opacity-75">{props.text}</p>
    </div>
  )
}

const movementStiffness = 16
const closenessThreshold = 0.001
const wheelScaleStep = 1.2
const manualScaleStep = 1.5

function LargePreview({ resource }: { resource: SuspenseResource<string> }) {
  const src = resource.read()

  const currentTransform = React.useRef({ x: 0, y: 0, scale: 1 })
  const targetTransform = React.useRef({ x: 0, y: 0, scale: 1 })

  const containerRef = React.useRef<HTMLDivElement>(null)
  const containerRect = useRectRef(containerRef)

  const imageRef = React.useRef<HTMLImageElement>(null)
  const imageRect = useRectRef(imageRef)

  const isDown = React.useRef(false)
  const cursor = React.useRef({ x: 0, y: 0 })

  const zoomDisplayRef = React.useRef<HTMLButtonElement>(null)

  const zoomBy = (factor: number, origin: "cursor" | "viewport") => {
    const newScale = clamp(targetTransform.current.scale * factor, 1, 10)
    if (newScale === targetTransform.current.scale) return

    const imageCenterX = targetTransform.current.x
    const imageCenterY = targetTransform.current.y

    let zoomOriginX = 0
    let zoomOriginY = 0

    if (origin === "cursor") {
      // get cursor coordinates relative to the container center
      const cursorX =
        cursor.current.x -
        (containerRect.current.x + containerRect.current.width / 2)
      const cursorY =
        cursor.current.y -
        (containerRect.current.y + containerRect.current.height / 2)

      // use a point a bit further than the cursor
      zoomOriginX = lerp(zoomOriginX, cursorX, 1.4)
      zoomOriginY = lerp(zoomOriginY, cursorY, 1.4)
    }

    const offsetX = zoomOriginX - imageCenterX
    const offsetY = zoomOriginY - imageCenterY

    targetTransform.current.x -= offsetX * factor - offsetX
    targetTransform.current.y -= offsetY * factor - offsetY
    targetTransform.current.scale = newScale
  }

  useWindowEvent("pointerup", () => (isDown.current = false))
  useWindowEvent("pointerleave", () => (isDown.current = false))
  useWindowEvent("pointerdown", (event) => {
    const container = containerRef.current ?? raise("Container not assigned")
    if (container.contains(event.target as Node)) {
      event.preventDefault()
      isDown.current = true
    }
  })

  useWindowEvent("pointermove", (event) => {
    cursor.current = { x: event.clientX, y: event.clientY }

    if (isDown.current) {
      event.preventDefault()
      targetTransform.current.x += event.movementX
      targetTransform.current.y += event.movementY
    }
  })

  useWindowEvent("wheel", (event) => {
    if (event.deltaY > 0) {
      zoomBy(1 / wheelScaleStep, "viewport")
    } else {
      zoomBy(wheelScaleStep, "cursor")
    }
  })

  useAnimationLoop((delta) => {
    if (!imageRef.current) return

    const fitMultiplier = Math.min(
      containerRect.current.width / imageRect.current.width,
      containerRect.current.height / imageRect.current.height,
    )

    if (!isDown.current) {
      const imageWidth =
        imageRect.current.width * fitMultiplier * targetTransform.current.scale

      const imageHeight =
        imageRect.current.height * fitMultiplier * targetTransform.current.scale

      const constraintX = Math.max(
        0,
        (imageWidth - containerRect.current.width) / 2,
      )
      const constraintY = Math.max(
        0,
        (imageHeight - containerRect.current.height) / 2,
      )
      targetTransform.current.x = clamp(
        targetTransform.current.x,
        -constraintX,
        constraintX,
      )
      targetTransform.current.y = clamp(
        targetTransform.current.y,
        -constraintY,
        constraintY,
      )
    }

    for (const key of ["x", "y", "scale"] as const) {
      const current = currentTransform.current[key]
      const target = targetTransform.current[key]
      const isClose = Math.abs(current - target) < closenessThreshold

      currentTransform.current[key] = isClose
        ? target
        : lerp(currentTransform.current[key], target, delta * movementStiffness)
    }

    const x =
      containerRect.current.x +
      containerRect.current.width / 2 -
      imageRect.current.width / 2 +
      currentTransform.current.x
    const y =
      containerRect.current.y +
      containerRect.current.height / 2 -
      imageRect.current.height / 2 +
      currentTransform.current.y

    imageRef.current.style.transform = `translate(${x}px, ${y}px) scale(${
      currentTransform.current.scale * fitMultiplier
    })`

    if (zoomDisplayRef.current) {
      zoomDisplayRef.current.textContent = `${Math.round(
        currentTransform.current.scale * 100,
      )}%`
    }
  })

  return (
    <Dialog.Content className="radix-transition s-full flex flex-col gap-4 p-4">
      <div
        className="min-h-0 flex-1 cursor-grab active:cursor-grabbing"
        ref={containerRef}
      >
        <img
          src={src}
          alt=""
          className="touch-none select-none active:cursor-grabbing"
          ref={imageRef}
          draggable={false}
        />
      </div>
      <div className="relative flex justify-center gap-4">
        <Dialog.Close className="button">Close</Dialog.Close>
        <div className="h-full w-px bg-white/10" />
        <button
          type="button"
          className="button"
          title="Zoom out"
          onClick={() => {
            zoomBy(1 / manualScaleStep, "viewport")
          }}
        >
          <lucide.Minus />
        </button>
        <button
          className="tabular-nums button"
          onClick={() => {
            targetTransform.current.scale = 1
          }}
          ref={zoomDisplayRef}
        ></button>
        <button
          type="button"
          className="button"
          title="Zoom in"
          onClick={() => {
            zoomBy(manualScaleStep, "viewport")
          }}
        >
          <lucide.Plus />
        </button>
      </div>
    </Dialog.Content>
  )
}

function useRectRef(elementRef: MaybeRef<Element>) {
  const rectRef = React.useRef({ x: 0, y: 0, width: 0, height: 0 })

  React.useEffect(() => {
    const element = extractRef(elementRef)
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) throw new Error("ResizeObserver entry not found")
      rectRef.current = entry.contentRect
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [elementRef])

  return rectRef
}
