import {
  DebouncedExpandingTextArea,
  DebouncedInput,
} from "../../ui/debounced-input"
import { Field } from "../../ui/field"
import { inputClass, textAreaClass } from "../../ui/styles"

export type CharacterFieldsEditorProps = {
  fields: Array<{ id: string; name: string; isLong: boolean }>
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
          <Field key={field.id} label={field.name}>
            <InputComponent
              placeholder={`Enter your ${field.name.toLowerCase()}.`}
              value={props.fieldValues[field.id] ?? ""}
              onChangeText={(value) => props.onChange(field.id, value)}
              debouncePeriod={500}
              className={field.isLong ? textAreaClass : inputClass}
              readOnly={props.readOnly}
            />
          </Field>
        )
      })}
    </div>
  )
}
