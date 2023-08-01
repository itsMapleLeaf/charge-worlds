import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { requireAdminUser } from "./auth"

export const list = query({
	args: {
		sessionId: v.id("sessions"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId)
		await requireAdminUser(ctx, session?.userId)

		const players = await ctx.db.query("players").collect()

		return Promise.all(
			players.map(async (player) => {
				const user = await ctx.db
					.query("users")
					.withIndex("by_discord_id", (q) =>
						q.eq("discordId", player.discordUserId),
					)
					.unique()

				return { ...player, name: user?.name }
			}),
		)
	},
})

export const add = mutation({
	args: {
		sessionId: v.id("sessions"),
		discordUserId: v.string(),
	},
	handler: async (ctx, { sessionId, ...args }) => {
		const session = await ctx.db.get(sessionId)
		await requireAdminUser(ctx, session?.userId)

		const existing = await ctx.db
			.query("players")
			.withIndex("by_discord_id", (q) =>
				q.eq("discordUserId", args.discordUserId),
			)
			.first()
		if (existing) {
			throw new Error("Player is already added")
		}

		await ctx.db.insert("players", args)
	},
})

export const remove = mutation({
	args: {
		sessionId: v.id("sessions"),
		id: v.id("players"),
	},
	handler: async (ctx, args) => {
		const session = await ctx.db.get(args.sessionId)
		await requireAdminUser(ctx, session?.userId)
		await ctx.db.delete(args.id)
	},
})
