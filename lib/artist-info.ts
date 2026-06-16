import { artistInfoDatabase } from "@/data/artist-info-db"

export interface ArtistInfo {
  bio: string
  country?: string
  countryCode?: string
  flag?: string
  /** True when the festival performance is a live act (not a DJ set). */
  isLive?: boolean
  tags: string[]
  labels: string[]
  festivals: string[]
  residentAdvisorUrl: string
  sourceLabel?: string
  sourceUrl?: string
}

function cleanArtistQuery(name: string) {
  return name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+feat\..*$/i, "")
    .replace(/\s+presents.*$/i, "")
    .replace(/\s+pres\..*$/i, "")
    .replace(/\s*&\s*/g, " ")
    .replace(/\s*,.*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getResidentAdvisorSearchUrl(name: string) {
  return `https://ra.co/search?search=${encodeURIComponent(cleanArtistQuery(name))}`
}

/** Returns a concrete RA profile/event URL, or undefined for generic search fallbacks. */
export function getResidentAdvisorProfileUrl(url: string): string | undefined {
  for (const candidate of url.split("|").map((part) => part.trim()).filter(Boolean)) {
    try {
      const parsed = new URL(candidate)
      const host = parsed.hostname.replace(/^www\./, "")
      if (host !== "ra.co") continue
      if (parsed.pathname.startsWith("/search")) continue
      return candidate
    } catch {
      continue
    }
  }
  return undefined
}

function fallbackArtistInfo(name: string): ArtistInfo {
  return {
    bio: "",
    tags: [],
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorSearchUrl(name),
    sourceLabel: "Local fallback",
  }
}

export function getArtistInfo(name: string): ArtistInfo {
  return artistInfoDatabase[name] || fallbackArtistInfo(name)
}

export async function fetchArtistInfo(name: string): Promise<ArtistInfo> {
  return getArtistInfo(name)
}
