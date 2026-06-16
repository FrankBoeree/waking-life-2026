import { artistInfoDatabase } from "@/data/artist-info-db"

export interface ArtistInfo {
  bio: string
  country?: string
  countryCode?: string
  flag?: string
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

function fallbackArtistInfo(name: string): ArtistInfo {
  return {
    bio: `${name} appears on the Waking Life 2026 lineup. A reliable imported artist profile was not found for this exact name, so this panel is ready for a verified short bio about their sound and background.`,
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
