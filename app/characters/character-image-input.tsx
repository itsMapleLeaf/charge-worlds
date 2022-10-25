import { ImagePlus } from "lucide-react"
import { useCallback } from "react"
import { LoadingSpinner } from "../ui/loading"
import type { Character } from "./character-schema"

export function CharacterImageInput({
  character,
  onImageChange,
}: {
  character: Character
  onImageChange: (imageUrl: string) => void
}) {
  return character.imageUrl ? (
    <ImagePreview src={character.imageUrl} />
  ) : (
    <div className="bg-black/50">
      <DropzonePlaceholder />
    </div>
  )
}

function ImagePreview({ src }: { src: string }) {
  const ref = useCallback(
    (root: HTMLElement | null) => {
      if (!root) return

      const imageElement = root.querySelector(
        "[data-image]",
      ) as HTMLImageElement

      const loadingElement = root.querySelector(
        "[data-loading]",
      ) as HTMLDivElement

      const image = new Image()
      image.src = src
      if (image.complete) {
        imageElement.style.opacity = "1"
        loadingElement.style.opacity = "0"
        return
      }

      imageElement.style.opacity = "0"
      loadingElement.style.opacity = "1"
      image.addEventListener(
        "load",
        () => {
          imageElement.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 200,
            fill: "forwards",
          })
          loadingElement.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 200,
            fill: "forwards",
          })
        },
        { once: true },
      )
    },
    [src],
  )

  return (
    <div className="group relative h-full" ref={ref}>
      <div className="absolute inset-0 overflow-clip rounded-md" data-image>
        <div
          style={{ backgroundImage: `url(${src})` }}
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat blur-md brightness-50"
        />
        <div
          style={{ backgroundImage: `url(${src})` }}
          className="absolute inset-0 bg-contain bg-center bg-no-repeat "
        />
      </div>
      <div
        className="absolute inset-0 grid place-items-center p-4"
        data-loading
      >
        <LoadingSpinner />
      </div>
      <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-60">
        <DropzonePlaceholder />
      </div>
    </div>
  )
}

function DropzonePlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <ImagePlus size={48} />
      <span>Add a reference image</span>
    </div>
  )
}
