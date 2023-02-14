import type { ReactNode } from "react"
import { useId } from "react"
import {
  DebouncedExpandingTextArea,
  DebouncedInput,
} from "../ui/debounced-input"
import { inputClass, textAreaClass } from "../ui/styles"
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
        const InputComponent = field.isLong
          ? DebouncedExpandingTextArea
          : DebouncedInput

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
                  onChangeText={(value) => props.onChange(field.id, value)}
                  debouncePeriod={500}
                  className={field.isLong ? textAreaClass : inputClass}
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
