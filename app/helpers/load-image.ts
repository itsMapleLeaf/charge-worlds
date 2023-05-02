export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.src = src
    if (image.complete) {
      resolve(image)
    } else {
      image.addEventListener("load", () => resolve(image))
      image.addEventListener("error", reject)
    }
  })
}
