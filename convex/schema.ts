import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatar: v.union(v.string(), v.null()),
    discordId: v.string(),
    discordAccessToken: v.string(),
  }).index("by_discord_id", ["discordId"]),
  sessions: defineTable({
    userId: v.id("users"),
  }),
  worlds: defineTable({
    name: v.string(),
  }),
})
