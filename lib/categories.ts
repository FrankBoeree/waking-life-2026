import type { Artist } from "@/data/timetable"
import { MUSIC_STAGES } from "@/data/timetable"

export const DEFAULT_ACT_CATEGORY = "Performance"

export function getArtistCategory(artist: Pick<Artist, "stage" | "category">): string {
  if (artist.category) return artist.category
  if (MUSIC_STAGES.has(artist.stage)) return "Music"
  return DEFAULT_ACT_CATEGORY
}

export function collectCategories(artists: Pick<Artist, "stage" | "category">[]): string[] {
  const categories = new Set<string>()
  for (const artist of artists) {
    categories.add(getArtistCategory(artist))
  }
  return [...categories].sort((a, b) => {
    if (a === "Music") return -1
    if (b === "Music") return 1
    return a.localeCompare(b)
  })
}
