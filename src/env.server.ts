import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .optional()
    .default("development"),

  CONVEX_URL: z.string(),
  CONVEX_HTTP_URL: z.string(),
  AUTH_CALLBACK_URL: z.string(),
})

export const env = envSchema.parse(process.env)
