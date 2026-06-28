import type { Artist } from "@/data/timetable"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import { getLastPerformanceEndDateTime } from "@/lib/festival-end"

export function isPostFestivalPreview(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).has("previewPostFestival")
}

export function isNowPreview(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).has("previewNow")
}

/** Fixed mid-festival moment for ?previewNow local testing. */
export function getPreviewNowDate(): Date {
  return new Date("2026-08-01T16:00:00")
}

export function isFestivalOver(
  now: Date = new Date(),
  timetable: Artist[] = [],
): boolean {
  if (isPostFestivalPreview()) return true

  const festivalEnd = getLastPerformanceEndDateTime(timetable)
  if (!festivalEnd) return false

  return now.getTime() >= festivalEnd.getTime()
}

export function isBeforeFestivalStart(now: Date = new Date()): boolean {
  return now.getTime() < new Date(FESTIVAL_CONFIG.officialStartDateTime).getTime()
}
