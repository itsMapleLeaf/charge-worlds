import { v } from "convex/values"
import { type Id } from "./_generated/dataModel"
import { mutation, query, type QueryCtx } from "./_generated/server"
import { raise } from "./helpers"
import { getSessionUser, requireAdminUser } from "./users"

export const list = query({
	args: {
		sessionId: v.union(v.id("sessions"), v.null()),
	},
	handler: async (ctx, args) => {
		await requireAdminUser(ctx, args.sessionId)

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
		await requireAdminUser(ctx, sessionId)

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
		await requireAdminUser(ctx, args.sessionId)
		await ctx.db.delete(args.id)
	},
})

export async function getSessionPlayer(
	ctx: QueryCtx,
	sessionId: Id<"sessions"> | null | undefined,
) {
	const user = await getSessionUser(ctx, sessionId)
	if (!user) return null

	return await getPlayerFromDiscordUserId(ctx, user.discordId)
}

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

export async function requireSessionPlayer(
	ctx: QueryCtx,
	sessionId: Id<"sessions"> | null | undefined,
) {
	const player = await getSessionPlayer(ctx, sessionId)
	return player ?? raise("Unauthorized")
}
