import { v } from "convex/values"
import { Doc, Id } from "./_generated/dataModel"
import { QueryCtx, internalMutation, query } from "./_generated/server"
import { env } from "./env"
import { raise } from "./helpers"

export const get = query({
	args: { id: v.id("users") },
	handler: async (ctx, args) => {
		return await getUser(ctx, args.id)
	},
})

export const getByDiscordId = query({
	args: { discordId: v.string() },
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_discord_id", (q) => q.eq("discordId", args.discordId))
			.first()
		return user ? withHelperProperties(user) : null
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

function withHelperProperties(user: Doc<"users">) {
	return { ...user, isAdmin: user.discordId === env.ADMIN_DISCORD_USER_ID }
}

export async function getUser(ctx: QueryCtx, userId: Id<"users">) {
	const user = await ctx.db.get(userId)
	return user ? withHelperProperties(user) : null
}

export async function requireUser(ctx: QueryCtx, userId: Id<"users">) {
	const user = await getUser(ctx, userId)
	return user ?? raise("User not found")
}
