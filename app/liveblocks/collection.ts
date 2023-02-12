import type { JsonObject, LsonObject } from "@liveblocks/client"
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client"
import type { ZodSchema } from "zod"
import type { RequiredKeys, Simplify } from "~/helpers/types"
import { useToastActions } from "~/ui/toast"
import { RoomContext } from "./liveblocks-client"

function useWarn() {
  const toast = useToastActions()
  return (...values: unknown[]) => {
    toast.add("error", "Oops, something went wrong")
    console.warn(...values)
  }
}

export function defineLiveblocksMapCollection<
  T extends { id: string } & JsonObject,
>(name: string, schema: ZodSchema<T>) {
  function useItem(id: string) {
    const warn = useWarn()
    return RoomContext.useStorage((root) => {
      const collectionMap = root[name]
      if (collectionMap == null) return undefined

      if (!(collectionMap instanceof Map)) {
        warn(`Expected ${name} to be a Map`)
        return undefined
      }

      const item = collectionMap.get(id)
      if (item == null) return undefined

      const result = schema.safeParse(item)
      if (!result.success) {
        warn(`Invalid ${name} item: ${result.error.message}`, item)
        return undefined
      }

      return result.data
    })
  }

  function useItems() {
    const warn = useWarn()
    return RoomContext.useStorage((root) => {
      const collectionMap = root[name]
      if (collectionMap == null) return []

      if (!(collectionMap instanceof Map)) {
        warn(`Expected ${name} to be a Map`)
        return []
      }

      const items: T[] = []
      for (const item of collectionMap.values()) {
        const result = schema.safeParse(item)
        if (!result.success) {
          warn(`Invalid ${name} item: ${result.error.message}`, item)
          continue
        }

        items.push(result.data)
      }

      return items
    })
  }

  function useMutations() {
    const warn = useWarn()

    const create = RoomContext.useMutation(
      ({ storage }, item: Simplify<Omit<T, "id">>) => {
        let map = storage.get(name)
        if (map == null) {
          map = new LiveMap<string, LiveObject<T>>()
          storage.set(name, map)
        }

        if (!(map instanceof LiveMap)) {
          warn(`Expected ${name} to be a LiveMap`)
          return
        }

        const id = crypto.randomUUID()
        map.set(id, new LiveObject<T>({ ...item, id } as any))
      },
      [],
    )

    const update = RoomContext.useMutation(
      ({ storage }, item: RequiredKeys<Partial<T>, "id">) => {
        let map = storage.get(name)
        if (map == null) {
          map = new LiveMap<string, LiveObject<T>>()
          storage.set(name, map)
        }

        if (!(map instanceof LiveMap)) {
          warn(`Expected ${name} to be a LiveMap`)
          return
        }

        const existing = map.get(item.id)
        if (existing == null) return

        if (!(existing instanceof LiveObject)) {
          warn(`Expected ${name} item to be a LiveObject`)
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
        warn(`Expected ${name} to be a LiveMap`)
        return
      }

      map.delete(id)
    }, [])

    return { create, update, remove }
  }

  return { useItem, useItems, useMutations }
}

export function defineLiveblocksListCollection<T extends JsonObject>(
  name: string,
  schema: ZodSchema<T>,
) {
  function useItems() {
    const warn = useWarn()
    return RoomContext.useStorage((root) => {
      const list = root[name]
      if (list == null) return []

      if (!Array.isArray(list)) {
        warn(`Expected ${name} to be a Map`)
        return []
      }

      const items: T[] = []
      for (const item of list) {
        const result = schema.safeParse(item)
        if (!result.success) {
          warn(`Invalid ${name} item: ${result.error.message}`, item)
          continue
        }

        items.push(result.data)
      }

      return items
    })
  }

  function useMutations() {
    const warn = useWarn()

    const resolveList = (storage: LiveObject<LsonObject>) => {
      let list = storage.get(name)
      if (list == null) {
        list = new LiveList<LiveObject<T>>()
        storage.set(name, list)
      }

      if (!(list instanceof LiveList)) {
        warn(`Expected ${name} to be a LiveList`)
        return
      }

      return list
    }

    const append = RoomContext.useMutation(({ storage }, item: T) => {
      resolveList(storage)?.push(new LiveObject<T>(item))
    }, [])

    const updateWhere = RoomContext.useMutation(
      ({ storage }, predicate: (item: T) => unknown, data: Partial<T>) => {
        const list = resolveList(storage)
        if (!list) return

        for (const item of list) {
          if (!(item instanceof LiveObject)) {
            console.warn(`Expected ${name} item to be a LiveObject`)
            continue
          }

          const result = schema.safeParse(item.toImmutable())
          if (!result.success) continue

          if (!predicate(result.data)) continue

          item.update(data)
        }
      },
      [],
    )

    const removeWhere = RoomContext.useMutation(
      ({ storage }, predicate: (item: T) => unknown) => {
        const list = resolveList(storage)
        if (!list) return

        for (let i = list.length - 1; i >= 0; i--) {
          const item = list.get(i)
          if (!(item instanceof LiveObject)) {
            console.warn(`Expected ${name} item to be a LiveObject`, item)
            continue
          }

          const result = schema.safeParse(item.toImmutable())
          if (!result.success) continue

          if (!predicate(result.data)) continue

          list.delete(i)
        }
      },
      [],
    )

    const move = RoomContext.useMutation(
      ({ storage }, fromIndex: number, toIndex: number) => {
        resolveList(storage)?.move(fromIndex, toIndex)
      },
      [],
    )

    return { append, updateWhere, removeWhere, move }
  }

  return { useItems, useMutations }
}
