type Json = string | number | boolean | null | Json[] | JsonObject
type JsonObject = { [key: string]: Json }

type JsonInput =
  | string
  | number
  | boolean
  | null
  | JsonInput[]
  | JsonInputObject
type JsonInputObject = { [key: string]: JsonInput | undefined }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface JSON {
  stringify(
    value: JsonInput,
    replacer?: (this: unknown, key: string, value: Json) => unknown,
    space?: string | number,
  ): string
  stringify(
    value: JsonInput | undefined,
    replacer?: (this: unknown, key: string, value: Json) => unknown,
    space?: string | number,
  ): string | undefined
  parse(text: string): Json
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Response {
  json(): Promise<Json>
}
