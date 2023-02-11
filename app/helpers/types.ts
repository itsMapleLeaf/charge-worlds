export type ValueOf<T> = T[keyof T]

export type UnionKeys<T> = T extends unknown ? keyof T : never

export type RequiredKeys<T, K extends keyof T> = Simplify<
  RequiredNonNullable<Pick<T, K>> & Omit<T, K>
>

export type Simplify<T> = { [K in keyof T]: T[K] } & {}

export type RequiredNonNullable<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}
