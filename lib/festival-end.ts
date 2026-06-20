import { days, type Artist } from "@/data/timetable"

function isOpenEndTime(time: string) {
  return !time || time === "--" || time === "..:.."
}

const dayDateById = new Map(days.map((day) => [day.id, day.date]))

function getArtistEndDateTime(artist: Artist): Date | null {
  if (artist.placeholderKind === "pause") return null

  const endDayId = artist.endDay ?? artist.startDay ?? artist.day
  if (!endDayId) return null

  const endDate = dayDateById.get(endDayId)
  if (!endDate) return null

  if (!isOpenEndTime(artist.endTime)) {
    return new Date(`${endDate}T${artist.endTime}:00`)
  }

  if (artist.durationMinutes == null || artist.durationMinutes <= 0) return null

  const startDayId = artist.startDay ?? artist.day ?? endDayId
  const startDate = dayDateById.get(startDayId)
  if (!startDate || !artist.startTime) return null

  const start = new Date(`${startDate}T${artist.startTime}:00`)
  return new Date(start.getTime() + artist.durationMinutes * 60 * 1000)
}

export function getLastPerformanceEndDateTime(artists: Artist[]): Date | null {
  let latest: Date | null = null

  for (const artist of artists) {
    const end = getArtistEndDateTime(artist)
    if (!end) continue
    if (!latest || end.getTime() > latest.getTime()) {
      latest = end
    }
  }

  return latest
}
