import { type DatabaseReader, type DatabaseWriter } from "./_generated/server"

export async function validateAdmin(
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
