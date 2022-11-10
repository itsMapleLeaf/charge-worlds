import { useFetcher } from "@remix-run/react"
import { useCallback } from "react"
import { route } from "routes-gen"
import { useLatestRef } from "../helpers/react"

export function action() {
  return { ok: true }
}

export function useInvalidate() {
  const fetcherRef = useLatestRef(useFetcher())
  return useCallback(() => {
    fetcherRef.current.submit(null, {
      action: route("/invalidate"),
      method: "post",
    })
  }, [fetcherRef])
}
