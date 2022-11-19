import type { ComponentProps } from "react"
import { createElement, useState } from "react"
import TextArea from "react-expanding-textarea"
import { autoRef } from "../helpers/react"
import { useDebouncedCallback } from "../helpers/use-debounced-callback"

export type DebouncedInputOptions = {
  value: string
  onChangeText: (value: string) => void
  debouncePeriod: number
}

export type DebouncedInputProps = ReturnType<typeof useDebouncedInput>

export function useDebouncedInput(props: DebouncedInputOptions) {
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

function createDebouncedInputComponent<C extends React.ElementType>(
  component: C,
  name: string,
) {
  function Component({
    value,
    debouncePeriod,
    onChangeText,
    ...props
  }: ComponentProps<C> & DebouncedInputOptions) {
    return createElement(component, {
      ...props,
      ...useDebouncedInput({ value, debouncePeriod, onChangeText }),
    })
  }

  Component.displayName = name

  return autoRef(Component)
}

export const DebouncedInput = createDebouncedInputComponent(
  "input",
  "DebouncedInput",
)

export const DebouncedTextArea = createDebouncedInputComponent(
  "textarea",
  "DebouncedTextArea",
)

export const DebouncedExpandingTextArea = createDebouncedInputComponent(
  TextArea,
  "DebouncedExpandingTextArea",
)
