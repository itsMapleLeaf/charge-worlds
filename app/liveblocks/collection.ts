import type { JsonObject } from "@liveblocks/client"
import { LiveMap, LiveObject } from "@liveblocks/client"
import type { ZodSchema } from "zod"
import { RoomContext } from "./liveblocks-client"

export function defineLiveblocksCollection<
  T extends { id: string } & JsonObject,
>(name: string, schema: ZodSchema<T>) {
  function useItem(id: string) {
    return RoomContext.useStorage((root) => {
      const collectionMap = root[name]
      if (collectionMap == null) return undefined

      if (!(collectionMap instanceof Map)) {
        console.warn(`Expected ${name} to be a Map`)
        return undefined
      }

      const item = collectionMap.get(id)
      if (item == null) return undefined

      const result = schema.safeParse(item)
      if (!result.success) {
        console.warn(`Invalid ${name} item: ${result.error.message}`, item)
        return undefined
      }

      return result.data
    })
  }

  function useItems() {
    return RoomContext.useStorage((root) => {
      const collectionMap = root[name]
      if (collectionMap == null) return []

      if (!(collectionMap instanceof Map)) {
        console.warn(`Expected ${name} to be a Map`)
        return []
      }

      const items: T[] = []
      for (const item of collectionMap.values()) {
        const result = schema.safeParse(item)
        if (!result.success) {
          console.warn(`Invalid ${name} item: ${result.error.message}`, item)
          continue
        }

        items.push(result.data)
      }

      return items
    })
  }

  function useMutations() {
    const create = RoomContext.useMutation(
      ({ storage }, item: Omit<T, "id">) => {
        let map = storage.get(name)
        if (map == null) {
          map = new LiveMap<string, LiveObject<T>>()
          storage.set(name, map)
        }

        if (!(map instanceof LiveMap)) {
          console.warn(`Expected ${name} to be a LiveMap`)
          return
        }

        const id = crypto.randomUUID()
        map.set(id, new LiveObject<T>({ ...item, id } as any))
      },
      [],
    )

    const update = RoomContext.useMutation(
      ({ storage }, item: { id: string } & Partial<T>) => {
        let map = storage.get(name)
        if (map == null) {
          map = new LiveMap<string, LiveObject<T>>()
          storage.set(name, map)
        }

        if (!(map instanceof LiveMap)) {
          console.warn(`Expected ${name} to be a LiveMap`)
          return
        }

        const existing = map.get(item.id)
        if (existing == null) return

        if (!(existing instanceof LiveObject)) {
          console.warn(`Expected ${name} item to be a LiveObject`)
          return
        }

        existing.update(item)
      },
      [],
    )

    const remove = RoomContext.useMutation(({ storage }, id: string) => {
      const map = storage.get(name)
      if (map == null) return

      if (!(map instanceof LiveMap)) {
        console.warn(`Expected ${name} to be a LiveMap`)
        return
      }

      map.delete(id)
    }, [])

    return { create, update, remove }
  }

  return { useItem, useItems, useMutations }
}
