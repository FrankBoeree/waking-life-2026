export interface Artist {
  id: string
  name: string
  startTime: string
  endTime: string
  stage: string
  day?: string
  startDay?: string
  endDay?: string
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

export const days: Day[] = [
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
]

// The official 2026 timetable has not been published yet.
// Keep this intentionally empty so last year's slots are never shown as current.
export const timetable: Artist[] = []
