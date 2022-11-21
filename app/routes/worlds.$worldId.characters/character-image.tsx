import clsx from "clsx"
import { FileX, ImagePlus } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { LoadingSpinner } from "../../ui/loading"

export function CharacterImage({ src }: { src: string | undefined }) {
  return src ? (
    <ImagePreview src={src} />
  ) : (
    <div className="h-full rounded-md bg-black/25">
      <DropzonePlaceholder />
    </div>
  )
}

type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | { status: "success"; value: T }

function useAsync<T>(callback: () => T | PromiseLike<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" })

  useEffect(() => {
    let cancelled = false

    setState({ status: "loading" })
    Promise.resolve(callback()).then(
      (value) => !cancelled && setState({ status: "success", value }),
      (error) => !cancelled && setState({ status: "error", error }),
    )

    return () => {
      cancelled = true
    }
  }, [callback])

  return state
}

function ImagePreview({ src }: { src: string }) {
  const state = useAsync(useCallback(() => loadImage(src), [src]))

  return (
    <div className="group relative h-full overflow-clip rounded-md bg-black/25">
      <div
        className={clsx(
          "absolute inset-0 grid place-items-center p-4 transition-opacity",
          state.status === "loading" ? "opacity-100" : "opacity-0",
        )}
      >
        <LoadingSpinner />
      </div>

      <div
        className={clsx(
          "absolute inset-0 grid place-content-center place-items-center gap-4 p-4 text-center transition-opacity",
          state.status === "error" ? "opacity-100" : "opacity-0",
        )}
      >
        <FileX size={48} />
        <p>Failed to load image</p>
      </div>

      <div
        className={clsx(
          "absolute inset-0 transition-opacity",
          state.status === "success" ? "opacity-100" : "opacity-100",
        )}
      >
        <div
          style={{ backgroundImage: `url(${src})` }}
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat blur-md brightness-50"
        />
        <div
          style={{ backgroundImage: `url(${src})` }}
          className="absolute inset-0 bg-contain bg-center bg-no-repeat "
        />
      </div>

      <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-60">
        <DropzonePlaceholder />
      </div>
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", reject)
    image.src = src
  })
}

function DropzonePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <ImagePlus size={48} />
      <span>Add a reference image</span>
    </div>
  )
}
