import type { LucideIcon } from "lucide-react"
import { Clock, Image, Type } from "lucide-react"
import type { ReactElement } from "react"
import TextArea from "react-expanding-textarea"
import { ClockInput as ClockInputComponent } from "../ui/clock-input"
import { RichImage } from "../ui/rich-image"

export type CardBlockComponentProps<DataKeys extends string = never> = {
  data: { [K in DataKeys]?: Json }
  onChange: (data: { [K in DataKeys]?: Json }) => void
}

export type CardBlockType<DataKeys extends string = never> = {
  icon: LucideIcon
  initialData: { [K in DataKeys]?: Json }
  StaticComponent: (props: CardBlockComponentProps<DataKeys>) => ReactElement
  EditorComponent: (props: CardBlockComponentProps<DataKeys>) => ReactElement
}

const defineCardBlockType = <Keys extends string>(
  options: CardBlockType<Keys>,
) => options

export const cardBlockTypes: Record<string, CardBlockType> = {
  text: defineCardBlockType({
    icon: Type,
    initialData: { text: "" },
    StaticComponent: (props) => (
      <p className="whitespace-pre-line">{String(props.data.text)}</p>
    ),
    EditorComponent: (props) => (
      <TextArea
        aria-label="Content"
        placeholder="Write something interesting!"
        className="resize-none border-0 rounded-0 bg-transparent ring-inset textarea"
        value={String(props.data.text)}
        onChange={(e) => props.onChange({ text: e.target.value })}
      />
    ),
  }),

  image: defineCardBlockType({
    icon: Image,
    initialData: { src: "" },
    StaticComponent: (props) => (
      <div className="aspect-square">
        <RichImage src={String(props.data.src)} />
      </div>
    ),
    EditorComponent: (props) => (
      <>
        <input
          type="text"
          aria-label="Image URL"
          value={String(props.data.src)}
          placeholder="https://example.com/image.png"
          className="border-0 border-b rounded-0 bg-transparent ring-inset input"
          onChange={(e) => props.onChange({ src: e.target.value })}
        />
        <div className="aspect-square">
          <RichImage src={String(props.data.src)} />
        </div>
      </>
    ),
  }),

  clock: defineCardBlockType({
    icon: Clock,
    initialData: { name: "", progress: 0, maxProgress: 4 },
    StaticComponent: ClockCardBlock,
    EditorComponent: ClockCardBlock,
  }),
}

function ClockCardBlock({
  data,
  onChange,
}: CardBlockComponentProps<"name" | "progress" | "maxProgress">) {
  return (
    <div className="flex flex-col items-center p-2">
      <ClockInputComponent
        name={String(data.name)}
        progress={typeof data.progress === "number" ? data.progress : 0}
        maxProgress={
          typeof data.maxProgress === "number" ? data.maxProgress : 4
        }
        onNameChange={(name) => onChange({ ...data, name })}
        onProgressChange={(progress) => onChange({ ...data, progress })}
        onMaxProgressChange={(maxProgress) =>
          onChange({ ...data, maxProgress })
        }
      />
    </div>
  )
}
