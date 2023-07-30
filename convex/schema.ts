import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  sessions: defineTable({
    discordAccessToken: v.string(),
  }),
  worlds: defineTable({
    name: v.string(),
  }),
})
