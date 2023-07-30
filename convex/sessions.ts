import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"

export const get = query({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => ctx.db.get(args.id),
})

export const create = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => ctx.db.insert("sessions", args),
})

export const remove = internalMutation({
  args: { id: v.id("sessions") },
  async handler(ctx, args) {
    await ctx.db.delete(args.id)
  },
})
