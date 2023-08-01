import { v } from "convex/values"
import { type Id } from "./_generated/dataModel"
import { internalMutation, query, type QueryCtx } from "./_generated/server"
import { raise } from "./helpers"

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

export async function requireSession(ctx: QueryCtx, sessionId: Id<"sessions">) {
	const session = await ctx.db.get(sessionId)
	return session ?? raise("Not logged in")
}
