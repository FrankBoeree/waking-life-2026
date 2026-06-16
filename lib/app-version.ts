import { FESTIVAL_CONFIG } from "@/lib/festival-config"

export const APP_CACHE_VERSION_KEY = "waking-life-app-cache-version"

interface AppVersionPayload {
  cacheVersion: string
}

export function getInstalledAppVersion(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(APP_CACHE_VERSION_KEY)
}

export function markAppVersionInstalled(version: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(APP_CACHE_VERSION_KEY, version)
}

export async function fetchPublishedAppVersion(): Promise<string | null> {
  if (typeof window === "undefined" || !navigator.onLine) return null

  try {
    const response = await fetch(`/app-version.json?check=${Date.now()}`, {
      cache: "no-store",
    })

    if (!response.ok) return null

    const payload = (await response.json()) as AppVersionPayload
    return typeof payload.cacheVersion === "string" ? payload.cacheVersion : null
  } catch {
    return null
  }
}

export async function checkForAppUpdate(): Promise<boolean> {
  const published = await fetchPublishedAppVersion()
  if (!published) return false

  const installed = getInstalledAppVersion()
  const bundled = FESTIVAL_CONFIG.cacheVersion

  if (published !== bundled) return true
  if (installed && installed !== published) return true

  return false
}

export function markCurrentAppVersionInstalled(): void {
  markAppVersionInstalled(FESTIVAL_CONFIG.cacheVersion)
}
