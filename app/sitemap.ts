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

function sitePath(path = ""): string {
  const base = FESTIVAL_CONFIG.siteUrl.replace(/\/$/, "")
  if (!path) return `${base}/`
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: sitePath(),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...GEO_ASSET_PATHS.map((path) => ({
      url: sitePath(path),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ]
}
