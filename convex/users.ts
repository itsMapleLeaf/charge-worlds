import { v } from "convex/values"
import { internalMutation, query } from "./_generated/server"
import { env } from "./env"

export const get = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.id)
		if (!user) return null
		return {
			...user,
			isAdmin: user.discordId === env.ADMIN_DISCORD_USER_ID,
		}
	},
})

export const getByDiscordId = query({
	args: { discordId: v.string() },
	handler: async (ctx, args) =>
		ctx.db
			.query("users")
			.withIndex("by_discord_id", (q) => q.eq("discordId", args.discordId))
			.first(),
})

export const create = internalMutation({
	args: {
		name: v.string(),
		avatar: v.union(v.string(), v.null()),
		discordId: v.string(),
		discordAccessToken: v.string(),
	},
	handler: async (ctx, args) => ctx.db.insert("users", args),
})

export const update = internalMutation({
	args: {
		id: v.id("users"),
		name: v.string(),
		avatar: v.union(v.string(), v.null()),
	},
	handler: async (ctx, { id, ...args }) => ctx.db.patch(id, args),
})

export const remove = internalMutation({
	args: { id: v.id("users") },
	handler: async (ctx, args) => ctx.db.delete(args.id),
})
