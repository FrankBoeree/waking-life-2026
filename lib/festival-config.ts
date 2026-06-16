export const PROGRAM_DAY_ORDER = [
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "monday",
] as const

export type ProgramDayId = (typeof PROGRAM_DAY_ORDER)[number]

export const FESTIVAL_OFFICIAL_DATE_RANGE = "16-22 juni 2026"

export const FESTIVAL_CONFIG = {
  year: 2026,
  title: "Waking Life 2026",
  appTitle: "Waking Life 2026 - Timetable",
  manifestName: "Waking Life 2026 Timetable",
  siteUrl: "https://wakinglife.netlify.app",
  description: `Festival timetable and lineup for Waking Life 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE})`,
  manifestDescription: `Festival timetable and lineup for Waking Life 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE}) - Works offline!`,
  officialDateRange: FESTIVAL_OFFICIAL_DATE_RANGE,
  officialStartDateTime: "2026-06-16T00:00:00",
  programStartDay: "wednesday" as ProgramDayId,
  programStartTime: "21:00",
  dataVersion: "2026.0.0",
  cacheVersion: "v2",
} as const
