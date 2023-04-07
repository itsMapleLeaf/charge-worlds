type Json = string | number | boolean | null | Json[] | JsonObject
type JsonObject = { [key: string]: Json }

type JsonInput = Exclude<Json, JsonObject> | JsonInputObject
type JsonInputObject = { [K in string]?: JsonInput | undefined }

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface JSON {
  stringify(value: JsonInput): string
  stringify(value: JsonInput | undefined): string | undefined
  parse(text: string): Json
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Response {
  json(): Promise<Json>
}
