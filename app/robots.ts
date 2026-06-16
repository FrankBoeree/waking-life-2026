import type { MetadataRoute } from "next"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${FESTIVAL_CONFIG.siteUrl}/sitemap.xml`,
  }
}
