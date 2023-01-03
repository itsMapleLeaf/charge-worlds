import { validateAdmin } from "./admin"
import { mutation, query } from "./_generated/server"

export const upsertUser = mutation(
  async (
    { db },
    args: {
      name: string
      discordId: string
      avatarUrl: string | null
      sessionId: string
      adminSecret: string
    },
  ) => {
    await validateAdmin(db, args.adminSecret)

    const existing = await db
      .query("users")
      .filter((q) => q.eq(q.field("discordId"), args.discordId))
      .first()

    if (existing) {
      await db.patch(existing._id, {
        name: args.name,
        avatarUrl: args.avatarUrl,
        sessionId: args.sessionId,
      })
    } else {
      await db.insert("users", {
        name: args.name,
        discordId: args.discordId,
        avatarUrl: args.avatarUrl,
        sessionId: args.sessionId,
      })
    }
  },
)

export const findUserBySessionId = query(
  async ({ db }, args: { sessionId: string; adminSecret: string }) => {
    await validateAdmin(db, args.adminSecret)
    return await db
      .query("users")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first()
  },
)
