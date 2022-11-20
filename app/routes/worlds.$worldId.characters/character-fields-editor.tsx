import type {
  CharacterField,
  CharacterFieldValue,
} from "../../generated/prisma"
import {
  DebouncedExpandingTextArea,
  DebouncedInput,
} from "../../ui/debounced-input"
import { Field } from "../../ui/field"
import { inputClass, textAreaClass } from "../../ui/styles"

export type CharacterFieldsEditorProps = {
  fields: Array<Pick<CharacterField, "id" | "name" | "isLong">>
  fieldValues: Array<Pick<CharacterFieldValue, "fieldId" | "value">>
  readOnly: boolean
  onChange: (fieldId: string, value: string) => void
}

export function CharacterFieldsEditor(props: CharacterFieldsEditorProps) {
  const fieldValueMap: Record<string, string> = {}
  for (const fieldValue of props.fieldValues) {
    fieldValueMap[fieldValue.fieldId] = fieldValue.value
  }

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
              value={fieldValueMap[field.id] ?? ""}
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
