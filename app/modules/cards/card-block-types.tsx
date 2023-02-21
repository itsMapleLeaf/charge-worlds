import type { LucideIcon } from "lucide-react"
import { Image, Type } from "lucide-react"
import type { ReactElement } from "react"
import TextArea from "react-expanding-textarea"
import type { ZodTypeDef } from "zod"
import { z } from "zod"

export type CardBlockType<Input = any, Output = any> = {
  icon: LucideIcon
  schema: z.ZodSchema<Output, ZodTypeDef, Input>
  initialData: Input
  StaticComponent: (props: {
    data: Output
    onChange: (data: Input) => void
  }) => ReactElement
  EditorComponent: (props: {
    data: Output
    onChange: (data: Input) => void
  }) => ReactElement
}

const defineCardBlockType = <Input, Output>(
  props: CardBlockType<Input, Output>,
) => props

export const cardBlockTypes: Record<string, CardBlockType> = {
  text: defineCardBlockType({
    icon: Type,
    schema: z.object({
      text: z.string().default(""),
    }),
    initialData: { text: "" },
    StaticComponent: ({ data }) => (
      <p className="whitespace-pre-line">{data.text}</p>
    ),
    EditorComponent: ({ data, onChange }) => (
      <TextArea
        aria-label="Content"
        placeholder="Write something interesting!"
        className="block w-full resize-none bg-transparent p-2 transition focus:text-foreground-8 focus:ring-0"
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
    ),
  }),

  image: defineCardBlockType({
    icon: Image,
    schema: z.object({
      src: z.string().default(""),
    }),
    initialData: { src: "" },
    StaticComponent: ({ data }) => <ImageBlockPreview src={data.src} />,
    EditorComponent: ({ data, onChange }) => (
      <>
        <input
          type="text"
          aria-label="Image URL"
          value={data.src}
          placeholder="https://example.com/image.png"
          className="w-full min-w-0 flex-1 bg-transparent p-2 transition focus:text-foreground-8 focus:ring-0"
          onChange={(e) => onChange({ src: e.target.value })}
        />
        <ImageBlockPreview src={data.src} />
      </>
    ),
  }),
}

function ImageBlockPreview(props: { src: string }) {
  return props.src ? (
    <div className="relative aspect-square">
      <img
        src={props.src}
        alt=""
        className="absolute inset-0 object-cover s-full"
      />
      <img
        src={props.src}
        alt=""
        className="absolute inset-0 object-contain backdrop-blur-md backdrop-brightness-50 s-full"
      />
    </div>
  ) : (
    <div className="flex aspect-square flex-col items-center justify-center gap-3 p-4 opacity-50">
      <Image className="s-32" aria-hidden />
      <p>No image provided</p>
    </div>
  )
}
