import { useEffect } from "react"
import ReconnectingEventSource from "reconnecting-eventsource"
import { useLatestRef } from "./react"

type Cleanup = () => void

const encoder = new TextEncoder()

export function eventStream(
  request: Request,
  callback: (send: (data: string) => void) => Cleanup | undefined | void,
) {
  const stream = new ReadableStream({
    start(controller) {
      if (request.signal.aborted) return

      const cleanup = callback((data) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      })

      request.signal.addEventListener("abort", () => {
        cleanup?.()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

export function useEventSource(url: string, callback: (data: string) => void) {
  const callbackRef = useLatestRef(callback)
  useEffect(() => {
    const source = new ReconnectingEventSource(url)
    source.addEventListener("message", (event) => {
      callbackRef.current(String(event.data))
    })
    return () => source.close()
  }, [callbackRef, url])
}
