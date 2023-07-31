import { raise } from "./errors"

/**
 * Resizes an image to a canvas while maintaining aspect ratio.
 * If the width is larger than the image width, does not make the image larger.
 */
export function resizeImage(image: HTMLImageElement, width: number) {
  width = Math.min(width, image.width)
  const height = image.height * (width / image.width)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext("2d") ?? raise("Could not get canvas context")
  ctx.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL("image/png")
}
