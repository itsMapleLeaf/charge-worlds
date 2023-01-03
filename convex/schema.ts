import { defineSchema, defineTable, s } from "convex/schema"

export default defineSchema({
  config: defineTable({
    adminSecret: s.string(),
  }),
  users: defineTable({
    name: s.string(),
    discordId: s.string(),
    avatarUrl: s.union(s.string(), s.null()),
    sessionId: s.union(s.string(), s.null()),
  }),
  worlds: defineTable({
    name: s.string(),
    createdAt: s.number(),
    owner: s.id("users"),
    players: s.array(s.id("users")),
  }),
})
