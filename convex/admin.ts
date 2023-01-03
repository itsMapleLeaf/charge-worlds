import {
  mutation,
  query,
  type DatabaseReader,
  type DatabaseWriter,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"

async function validateAdmin(
  db: DatabaseReader | DatabaseWriter,
  adminSecret: string,
) {
  const config = await db.query("config").first()
  if (!config) {
    throw new Error("No config found")
  }

  if (adminSecret !== config.adminSecret) {
    throw new Error("Invalid admin secret")
  }
}

export function adminQuery<Args extends unknown[], Return>(
  fn: (context: QueryCtx, ...args: Args) => Return,
) {
  return query(async (context, adminSecret: string, ...args: Args) => {
    await validateAdmin(context.db, adminSecret)
    return await fn(context, ...args)
  })
}

export function adminMutation<Args extends unknown[], Return>(
  fn: (context: MutationCtx, ...args: Args) => Return,
) {
  return mutation(async (context, adminSecret: string, ...args: Args) => {
    await validateAdmin(context.db, adminSecret)
    return await fn(context, ...args)
  })
}
