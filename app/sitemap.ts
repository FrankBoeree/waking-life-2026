import type { MetadataRoute } from "next"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: FESTIVAL_CONFIG.siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${FESTIVAL_CONFIG.siteUrl}/offline`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]
}
