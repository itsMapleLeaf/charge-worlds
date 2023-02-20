import type { ReactNode } from "react"
import { useId } from "react"
import ExpandingTextArea from "react-expanding-textarea"
import { input, textArea } from "../ui/input"
import type { CharacterField } from "./collections"

export type CharacterFieldsEditorProps = {
  fields: CharacterField[]
  fieldValues: Record<string, string>
  readOnly: boolean
  onChange: (fieldId: string, value: string) => void
}

export function CharacterFieldsEditor(props: CharacterFieldsEditorProps) {
  return (
    <div className="grid gap-4">
      {props.fields.map((field) => {
        const InputComponent = field.isLong ? ExpandingTextArea : "input"
        return (
          <Id key={field.id}>
            {(id) => (
              <div className="grid gap-1">
                <label className="font-medium leading-tight" htmlFor={id}>
                  {field.name}
                </label>
                {field.description ? (
                  <p className="whitespace-pre-line text-sm opacity-75">
                    {field.description}
                  </p>
                ) : (
                  <></>
                )}
                <InputComponent
                  id={id}
                  placeholder={`Enter your ${field.name.toLowerCase()}.`}
                  value={props.fieldValues[field.id] ?? ""}
                  onChange={(event) =>
                    props.onChange(field.id, event.target.value)
                  }
                  className={field.isLong ? textArea() : input()}
                  readOnly={props.readOnly}
                />
              </div>
            )}
          </Id>
        )
      })}
    </div>
  )
}

function Id({ children }: { children: (id: string) => ReactNode }) {
  return <>{children(useId())}</>
}
