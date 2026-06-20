import type { MetadataRoute } from "next"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

export const dynamic = "force-static"

const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/debug/"],
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/debug/"],
      })),
    ],
    sitemap: `${FESTIVAL_CONFIG.siteUrl}/sitemap.xml`,
  }
}
