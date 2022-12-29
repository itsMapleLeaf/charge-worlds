import PusherClient from "pusher-js"
import { createContext, useContext, useEffect, useState } from "react"

const PusherContext = createContext<PusherClient | undefined>(undefined)

export function PusherProvider(props: {
  pusherKey: string
  pusherCluster: string
  children: React.ReactNode
}) {
  const [client, setClient] = useState<PusherClient>()

  useEffect(() => {
    const client = new PusherClient(props.pusherKey, {
      cluster: props.pusherCluster,
    })
    setClient(client)
    return () => {
      client.disconnect()
    }
  }, [props.pusherKey, props.pusherCluster])

  return (
    <PusherContext.Provider value={client}>
      {props.children}
    </PusherContext.Provider>
  )
}

export function usePusher() {
  return useContext(PusherContext)
}
