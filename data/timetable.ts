import festivalData from "@/public/festival-data.json"

export interface Artist {
  id: string
  name: string
  startTime: string
  endTime: string
  stage: string
  day?: string
  startDay?: string
  endDay?: string
  category?: string
  hosts?: string
  description?: string
  /** Used when endTime is "..:.." or "--" to size the block on the timeline */
  durationMinutes?: number
  /** Generated timetable rows (e.g. Mimo has no published schedule) */
  placeholderKind?: "stage-program" | "pause"
}

export interface Stage {
  id: string
  name: string
  color: string
}

export interface Day {
  id: string
  name: string
  date: string
}

export const MUSIC_STAGES = new Set([
  "Floresta",
  "Praia",
  "Outro Lado",
  "Mimo",
  "Cochilo",
])

export const days: Day[] = [
  { id: "tuesday", name: "Tuesday", date: "2026-06-16" },
  { id: "wednesday", name: "Wednesday", date: "2026-06-17" },
  { id: "thursday", name: "Thursday", date: "2026-06-18" },
  { id: "friday", name: "Friday", date: "2026-06-19" },
  { id: "saturday", name: "Saturday", date: "2026-06-20" },
  { id: "sunday", name: "Sunday", date: "2026-06-21" },
  { id: "monday", name: "Monday", date: "2026-06-22" },
]

export const stages: Stage[] = [
  { id: "Floresta", name: "Floresta", color: "#8b5cf6" },
  { id: "Praia", name: "Praia", color: "#06b6d4" },
  { id: "Outro Lado", name: "Outro Lado", color: "#10b981" },
  { id: "Mimo", name: "Mimo", color: "#f59e0b" },
  { id: "Cochilo", name: "Cochilo", color: "#84cc16" },
  { id: "Apuro", name: "Apuro", color: "#f97316" },
  { id: "Moonscreen", name: "Moonscreen", color: "#6366f1" },
  { id: "Suna", name: "Suna", color: "#f43f5e" },
  { id: "Tudo Bem", name: "Tudo Bem", color: "#0ea5e9" },
]

// Bundled fallback; runtime refresh loads /festival-data.json.
export const timetable: Artist[] = festivalData.timetable as Artist[]
