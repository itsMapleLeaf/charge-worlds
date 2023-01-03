import { ConvexReactClient } from "convex/react"
import { type API } from "../convex/_generated/api"
import clientConfig from "../convex/_generated/clientConfig"

export const convex = new ConvexReactClient<API>(clientConfig)
