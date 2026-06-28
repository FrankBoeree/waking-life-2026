import type { MetadataRoute } from "next"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

export const dynamic = "force-static"

const GEO_ASSET_PATHS = [
  "/festival-data.json",
  "/artist-info.json",
  "/lineup-summary.md",
  "/llms.txt",
  "/geo-structured-data.json",
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: FESTIVAL_CONFIG.siteUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...GEO_ASSET_PATHS.map((path) => ({
      url: `${FESTIVAL_CONFIG.siteUrl}${path}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    {
      url: `${FESTIVAL_CONFIG.siteUrl}/offline`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]
}
