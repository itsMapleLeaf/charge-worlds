import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"

export const get = query({
  args: { id: v.id("sessions") },
  async handler(ctx, args) {
    return await ctx.db.get(args.id)
  },
})

export const create = internalMutation({
  args: { discordAccessToken: v.string() },
  async handler(ctx, args) {
    const sessionId = await ctx.db.insert("sessions", args)
    return { sessionId }
  },
})

export const remove = internalMutation({
  args: { sessionId: v.id("sessions") },
  async handler(ctx, args) {
    await ctx.db.delete(args.sessionId)
  },
})
