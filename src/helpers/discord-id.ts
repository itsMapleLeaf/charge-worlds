import { string } from "zod"

export const discordIdRegex = /^\d+$/

export const discordIdSchema = string().regex(
  discordIdRegex,
  "Value must be a valid discord ID",
)
