import { v } from "convex/values"
import { type Doc, type Id } from "./_generated/dataModel"
import {
	internalMutation,
	internalQuery,
	type QueryCtx,
} from "./_generated/server"
import { env } from "./env"
import { raise } from "./helpers"
import { getSessionUser, isAdminUser } from "./users"

export const get = internalQuery({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const getByDiscordId = internalQuery({
	args: { discordId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("users")
			.withIndex("by_discord_id", (q) => q.eq("discordId", args.discordId))
			.unique()
	},
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

export function isAdminUser(user: Doc<"users"> | null | undefined) {
	return user?.discordId === env.ADMIN_DISCORD_USER_ID
}

export async function getSessionUser(
	ctx: QueryCtx,
	sessionId: Id<"sessions"> | undefined | null,
) {
	if (!sessionId) return null

	const session = await ctx.db.get(sessionId)
	if (!session) return null

	return await ctx.db.get(session.userId)
}

export async function requireSessionUser(
	ctx: QueryCtx,
	sessionId: Id<"sessions"> | undefined | null,
) {
	const user = await getSessionUser(ctx, sessionId)
	return user ?? raise("User not found")
}

export async function requireAdminUser(
	ctx: QueryCtx,
	sessionId: Id<"sessions"> | undefined | null,
) {
	const user = await getSessionUser(ctx, sessionId)
	if (!isAdminUser(user)) {
		throw new Error("Unauthorized")
	}
	return user
}
