import type { MetadataRoute } from "next"
import { FESTIVAL_CONFIG, APP_SURFACE_COLORS } from "@/lib/festival-config"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: FESTIVAL_CONFIG.manifestName,
    short_name: "Dekmantel",
    description: FESTIVAL_CONFIG.manifestDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0e8",
    theme_color: APP_SURFACE_COLORS.light,
    orientation: "portrait",
    scope: "/",
    lang: "en",
    categories: ["entertainment", "music", "lifestyle"],
    icons: [
      {
        src: "/app-icon.png",
        sizes: "800x800",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
    shortcuts: [
      {
        name: "Favorites",
        short_name: "Favorites",
        description: "View your favorite artists",
        url: "/?view=favorites",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192"
          }
        ]
      },
      {
        name: "Timetable",
        short_name: "Schedule",
        description: "View festival timetable",
        url: "/?view=timetable",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192"
          }
        ]
      }
    ]
  }
}
