import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string(),

  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_REDIRECT_URI: z
    .string()
    .default("http://localhost:3000/auth/discord/callback"),
})

export const env = envSchema.parse(process.env)
