import type { LucideIcon } from "lucide-react"
import { Clock, Image, Type } from "lucide-react"
import type { ReactElement } from "react"
import TextArea from "react-expanding-textarea"
import type { ZodTypeDef } from "zod"
import { z } from "zod"
import { ClockCardBlock, clockSchema } from "../clocks/clock-card-block"
import { RichImage } from "../ui/rich-image"

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
    StaticComponent: ({ data }) => (
      <div className="aspect-square">
        <RichImage src={data.src} />
      </div>
    ),
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
        <div className="aspect-square">
          <RichImage src={data.src} />
        </div>
      </>
    ),
  }),

  clock: {
    icon: Clock,
    schema: clockSchema,
    initialData: { name: "", progress: 0, maxProgress: 4 },
    StaticComponent: ClockCardBlock,
    EditorComponent: ClockCardBlock,
  },
}
