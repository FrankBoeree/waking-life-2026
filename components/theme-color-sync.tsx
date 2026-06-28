"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { APP_SURFACE_COLORS } from "@/lib/festival-config"

function getSurfaceColor(resolvedTheme: string | undefined) {
  return resolvedTheme === "dark" ? APP_SURFACE_COLORS.dark : APP_SURFACE_COLORS.light
}

export function ThemeColorSync() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const color = getSurfaceColor(resolvedTheme)

    document.querySelectorAll('meta[name="theme-color"]').forEach((node) => node.remove())

    const meta = document.createElement("meta")
    meta.name = "theme-color"
    meta.content = color
    document.head.appendChild(meta)
  }, [resolvedTheme])

  return null
}
