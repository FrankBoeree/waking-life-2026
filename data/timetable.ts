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
  "The Loop",
  "UFO I",
  "UFO II",
  "The Nest",
  "Selectors",
  "Greenhouse",
  "Radar",
])

export const days: Day[] = [
  { id: "friday", name: "Friday", date: "2026-07-31" },
  { id: "saturday", name: "Saturday", date: "2026-08-01" },
  { id: "sunday", name: "Sunday", date: "2026-08-02" },
]

export const stages: Stage[] = [
  { id: "The Loop", name: "The Loop", color: "#E63946" },
  { id: "Selectors", name: "Selectors", color: "#2A9D8F" },
  { id: "UFO I", name: "UFO I", color: "#457B9D" },
  { id: "UFO II", name: "UFO II", color: "#1D3557" },
  { id: "The Nest", name: "The Nest", color: "#F4A261" },
  { id: "Greenhouse", name: "Greenhouse", color: "#E9C46A" },
  { id: "Radar", name: "Radar", color: "#9B5DE5" },
]

export const STAGE_COLORS: Record<string, string> = Object.fromEntries(
  stages.map((stage) => [stage.id, stage.color]),
)

// Bundled fallback; runtime refresh loads /festival-data.json.
export const timetable: Artist[] = festivalData.timetable as Artist[]
