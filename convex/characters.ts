import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireSessionPlayer } from "./players"
import { requireAdminUser } from "./users"

export const get = query({
	args: {
		id: v.id("characters"),
	},
	handler: async (ctx, args) => {
		return ctx.db.get(args.id)
	},
})

export const list = query({
	handler: async (ctx) => {
		return ctx.db.query("characters").collect()
	},
})

export const create = mutation({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
	},
	handler: async (ctx, { sessionId, ...args }) => {
		await requireAdminUser(ctx, sessionId)
		return ctx.db.insert("characters", {
			name: "New Character",
			condition: "",
		})
	},
})

export const update = mutation({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
		id: v.id("characters"),
		name: v.optional(v.string()),
		condition: v.optional(v.string()),
	},
	handler: async (ctx, { sessionId, id, ...args }) => {
		await requireSessionPlayer(ctx, sessionId)
		await ctx.db.patch(id, args)
	},
})

export const remove = mutation({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
		id: v.id("characters"),
	},
	handler: async (ctx, { sessionId, id }) => {
		await requireAdminUser(ctx, sessionId)
		await ctx.db.delete(id)
	},
})
