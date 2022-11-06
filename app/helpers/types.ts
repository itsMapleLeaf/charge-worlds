export type ValueOf<T> = T[keyof T]

export type UnionKeys<T> = T extends unknown ? keyof T : never
