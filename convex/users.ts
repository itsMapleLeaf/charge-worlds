import { adminMutation, adminQuery } from "./admin"

export const upsertUser = adminMutation(
  async (
    { db },
    args: {
      name: string
      discordId: string
      avatarUrl: string | null
      sessionId: string
    },
  ) => {
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

export const findUserBySessionId = adminQuery(
  ({ db }, args: { sessionId: string }) => {
    return db
      .query("users")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first()
  },
)
