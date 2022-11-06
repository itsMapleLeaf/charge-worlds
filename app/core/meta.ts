import type { HtmlMetaDescriptor } from "@remix-run/node"
import { truthyJoin } from "../helpers/truthy-join"

const siteUrl = "https://charge-worlds.mapleleaf.dev"

export function getAppMeta({
  title: titleArg = "",
  description: descriptionArg = "",
} = {}): HtmlMetaDescriptor {
  const title = truthyJoin(" | ", [titleArg, "Charge Worlds"])

  const description =
    descriptionArg || "Virtual environment for the Charge RPG system"

  return {
    // eslint-disable-next-line unicorn/text-encoding-identifier-case
    "charset": "utf-8",
    "viewport": "width=device-width,initial-scale=1",

    title,
    description,
    "theme-color": "#1e293b",

    "og:type": "website",
    "og:url": siteUrl,
    "og:title": title,
    "og:description": description,

    "twitter:card": "summary_large_image",
    "twitter:url": siteUrl,
    "twitter:title": title,
    "twitter:description": description,
  }
}
