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
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Meta-ExternalAgent",
] as const

const DISALLOWED_PATHS = ["/debug/", "/offline/"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${FESTIVAL_CONFIG.siteUrl}/sitemap.xml`,
  }
}
