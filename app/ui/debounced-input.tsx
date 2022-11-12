import type { ComponentProps } from "react"
import { useState } from "react"
import TextArea from "react-expanding-textarea"
import { autoRef } from "../helpers/react"
import { useDebouncedCallback } from "../helpers/use-debounced-callback"

export type DebouncedInputProps = {
  value: string
  onChangeText: (value: string) => void
  debouncePeriod: number
}

export function useDebouncedInput(props: DebouncedInputProps) {
  const [pendingValue, setPendingValue] = useState<string>()

  const onChangeTextDebounced = useDebouncedCallback((text: string) => {
    props.onChangeText(text)
    setPendingValue(undefined)
  }, props.debouncePeriod)

  return {
    value: pendingValue ?? props.value,
    onChange: (event: React.ChangeEvent<{ value: string }>) => {
      setPendingValue(event.target.value)
      onChangeTextDebounced(event.target.value)
    },
  }
}

export const DebouncedInput = autoRef(function DebouncedInput(
  props: ComponentProps<"input"> & DebouncedInputProps,
) {
  return <input {...props} {...useDebouncedInput(props)} />
})

export const DebouncedTextArea = autoRef(function DebouncedTextArea(
  props: ComponentProps<"textarea"> & DebouncedInputProps,
) {
  return <textarea {...props} {...useDebouncedInput(props)} />
})

export const DebouncedExpandingTextArea = autoRef(
  function DebouncedExpandingTextArea(
    props: ComponentProps<typeof TextArea> & DebouncedInputProps,
  ) {
    return <TextArea {...props} {...useDebouncedInput(props)} />
  },
)
