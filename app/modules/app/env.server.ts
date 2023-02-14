import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  DATABASE_URL: z.string(),
  COOKIE_SECRET: z.string(),

  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_REDIRECT_URI: z
    .string()
    .default("http://localhost:3000/auth/discord/callback"),

  LIVEBLOCKS_SECRET_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
