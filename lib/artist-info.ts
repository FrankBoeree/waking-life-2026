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
  }
}

const SOURCE_ABBREVIATIONS: Record<string, string> = {
  ra: "Resident Advisor",
  web: "Web",
  bandcamp: "Bandcamp",
  soundcloud: "SoundCloud",
  wikipedia: "Wikipedia",
  djmag: "DJ Mag",
  ade: "ADE",
  nts: "NTS",
  horst: "Horst",
  glamcult: "Glamcult",
  rateyourmusic: "Rate Your Music",
}

const INTERNAL_SOURCE_PATTERNS = [
  /ai\s*knowledge/i,
  /model[_\s-]?knowledge/i,
  /confidence\s*:/i,
  /second\s+(research\s+)?pass/i,
  /both\s+passes/i,
  /corroborat/i,
  /explicit\s+per/i,
  /explicit\s+on/i,
  /local\s+fallback/i,
  /unconfirmed/i,
  /program\s+image/i,
  /genre\/country/i,
  /from\s+model\s+knowledge/i,
  /festival\s+organizer\s+confirmation/i,
  /provided\s+(ra\s+)?bio/i,
  /event\s+listings/i,
  /label\/agency\s+pages/i,
  /artist\s+bios/i,
  /official\s+site/i,
]

function isTechnicalSourceFragment(fragment: string) {
  const normalized = fragment.trim()
  if (!normalized) return true
  return INTERNAL_SOURCE_PATTERNS.some((pattern) => pattern.test(normalized))
}

function formatSourceFragment(fragment: string) {
  const trimmed = fragment.trim()
  if (trimmed.includes("/")) {
    return trimmed
      .split("/")
      .map((part) => formatSourceFragment(part))
      .join(" & ")
  }

  const key = trimmed.toLowerCase()
  return SOURCE_ABBREVIATIONS[key] || trimmed
}

function formatHumanSourceLabel(label?: string) {
  if (!label?.trim()) return undefined

  const cleaned = label
    .trim()
    .replace(
      /\([^)]*(?:pass|corroborat|confidence|explicit|unconfirmed|model|knowledge|framing|identity|editorial|supported|alias|collaboration|approach)[^)]*\)/gi,
      "",
    )

  const parts = cleaned
    .split(/\s*[+|]\s*/)
    .map((part) => part.trim())
    .filter((part) => part && !isTechnicalSourceFragment(part))
    .map(formatSourceFragment)

  if (parts.length === 0) return undefined
  if (parts.length === 1) return parts[0]
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`
  return `${parts.slice(0, -1).join(", ")} & ${parts[parts.length - 1]}`
}

function getUrlSourceLabel(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "ra.co") return "Resident Advisor"

    const hostLabels: Record<string, string> = {
      "bandcamp.com": "Bandcamp",
      "soundcloud.com": "SoundCloud",
      "wikipedia.org": "Wikipedia",
      "djmag.com": "DJ Mag",
      "nts.live": "NTS",
    }

    for (const [domain, name] of Object.entries(hostLabels)) {
      if (host === domain || host.endsWith(`.${domain}`)) return name
    }

    return host
  } catch {
    return "Source"
  }
}

/** Returns a public-facing source link, hiding internal research metadata. */
export function getArtistSourceLink(
  info: ArtistInfo,
): { url: string; label: string } | null {
  const url = info.sourceUrl?.trim()
  if (!url || /ra\.co\/search/i.test(url)) return null

  const humanLabel = formatHumanSourceLabel(info.sourceLabel)
  const label =
    humanLabel && !isTechnicalSourceFragment(humanLabel)
      ? humanLabel
      : getUrlSourceLabel(url)

  return { url, label }
}

export function getArtistInfo(name: string): ArtistInfo {
  return artistInfoDatabase[name] || fallbackArtistInfo(name)
}

export async function fetchArtistInfo(name: string): Promise<ArtistInfo> {
  return getArtistInfo(name)
}
