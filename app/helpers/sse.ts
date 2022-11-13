import type { SerializeFrom } from "@remix-run/node"
import { useEffect } from "react"
import ReconnectingEventSource from "reconnecting-eventsource"
import { useLatestRef } from "./react"

type Cleanup = () => void

type EventStreamResponse<T> = Response & { __eventType: T }

type EventStreamFunction<T> = (
  ...args: any[]
) => EventStreamResponse<T> | PromiseLike<EventStreamResponse<T>>

type EventStreamData<F> = F extends EventStreamFunction<infer T>
  ? SerializeFrom<T>
  : unknown

const encoder = new TextEncoder()

export function eventStream<T>(
  request: Request,
  callback: (send: (data: T) => void) => Cleanup | undefined | void,
) {
  const stream = new ReadableStream({
    start(controller) {
      if (request.signal.aborted) return

      const cleanup = callback((data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
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
  }) as EventStreamResponse<T>
}

export function useEventSource<F extends EventStreamFunction<unknown>>(
  url: string,
  callback: (data: EventStreamData<F>) => void,
) {
  const callbackRef = useLatestRef(callback)
  useEffect(() => {
    const source = new ReconnectingEventSource(url)
    source.addEventListener("message", (event) => {
      callbackRef.current(JSON.parse(event.data))
    })
    return () => source.close()
  }, [callbackRef, url])
}
