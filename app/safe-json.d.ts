type JsonStringifyArgs = [
  replacer?: (this: unknown, key: string, value: Json) => unknown,
  space?: string | number,
]

type Json = string | number | boolean | null | Json[] | JsonObject
type JsonObject = { [key: string]: Json }

type JsonInput = Exclude<Json, JsonObject> | JsonInputObject
type JsonInputObject = { [K in string]?: JsonInput | undefined }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface JSON {
  stringify(value: JsonInput, ...args: JsonStringifyArgs): string
  stringify(
    value: JsonInput | undefined,
    ...args: JsonStringifyArgs
  ): string | undefined
  parse(text: string): Json
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Response {
  json(): Promise<Json>
}
