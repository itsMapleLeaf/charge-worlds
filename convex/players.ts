import { v } from "convex/values"
import { mutation, query, type QueryCtx } from "./_generated/server"
import { requireAdminRole } from "./auth"

export const list = query({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
	},
	handler: async (ctx, args) => {
		await requireAdminRole(ctx, args.sessionId)

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
		sessionId: v.union(v.id("sessions"), v.null()),
		discordUserId: v.string(),
	},
	handler: async (ctx, { sessionId, ...args }) => {
		await requireAdminRole(ctx, sessionId)

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
		sessionId: v.union(v.id("sessions"), v.null()),
		id: v.id("players"),
	},
	handler: async (ctx, args) => {
		await requireAdminRole(ctx, args.sessionId)
		await ctx.db.delete(args.id)
	},
})

export async function getPlayerFromDiscordUserId(
	ctx: QueryCtx,
	discordUserId: string | null | undefined,
) {
	if (!discordUserId) return null
	return await ctx.db
		.query("players")
		.withIndex("by_discord_id", (q) => q.eq("discordUserId", discordUserId))
		.unique()
}
