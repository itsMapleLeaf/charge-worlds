import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireAdminUser } from "./users"

const defaultWorld = {
	_id: "default",
	name: "New World",
}

export const get = query(async (ctx) => {
	const world = await ctx.db.query("worlds").first()
	return world ?? defaultWorld
})

export const update = mutation({
	args: {
		sessionId: v.id("sessions"),
		name: v.string(),
	},
	handler: async (ctx, { sessionId, ...args }) => {
		await requireAdminUser(ctx, sessionId)
		const world = await ctx.db.query("worlds").first()
		if (world) {
			await ctx.db.patch(world._id, args)
		} else {
			await ctx.db.insert("worlds", args)
		}
	},
})
