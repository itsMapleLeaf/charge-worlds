import { redirect } from "@remix-run/node"
import { env } from "~/env.server"

export const loader = () =>
  redirect(
    `${env.CONVEX_HTTP_URL}/auth/discord?callbackUrl=${env.AUTH_CALLBACK_URL}`,
  )
