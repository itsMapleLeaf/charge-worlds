import type { V2_MetaDescriptor } from "@vercel/remix"
import { truthyJoin } from "../helpers/truthy-join"

const siteUrl = "https://charge-worlds.mapleleaf.dev"

export function getAppMeta({
  title: titleArg = "",
  description: descriptionArg = "",
} = {}): V2_MetaDescriptor[] {
  const title = truthyJoin(" | ", [titleArg, "Charge Worlds"])

  const description =
    descriptionArg || "Virtual environment for the Charge RPG system"

  return [
    { title },
    { name: "description", content: description },
    { name: "theme-color", content: "#1e293b" },

    { property: "og:type", content: "website" },
    { property: "og:url", content: siteUrl },
    { property: "og:title", content: title },
    { property: "og:description", content: description },

    { name: "twitter:card", content: "summary" },
    { name: "twitter:url", content: siteUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ]
}
