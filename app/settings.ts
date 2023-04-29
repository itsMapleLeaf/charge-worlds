import { createCookie } from "@vercel/remix"
import { z } from "zod"

export type Settings = z.output<typeof settingsSchema>
const settingsSchema = z
  .object({
    fancyMode: z.boolean().catch(true),
  })
  .catch({
    fancyMode: true,
  })

const settingsCookie = createCookie("settings", {
  path: "/",
  sameSite: "strict",
  httpOnly: true,
})

export async function getSettings(request: Request) {
  return settingsSchema.parse(
    await settingsCookie.parse(request.headers.get("Cookie")),
  )
}

export async function updateSettingsFromForm(
  currentSettings: Settings,
  form: FormData,
) {
  const newSettings: Settings = {
    ...currentSettings,
    fancyMode: form.get("fancyMode") === "true",
  }
  return settingsCookie.serialize(newSettings)
}
