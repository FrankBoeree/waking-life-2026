export const PROGRAM_DAY_ORDER = [
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "monday",
] as const

export type ProgramDayId = (typeof PROGRAM_DAY_ORDER)[number]

export const FESTIVAL_OFFICIAL_DATE_RANGE = "16-22 June 2026"

export const FESTIVAL_CONFIG = {
  year: 2026,
  title: "Waking Life 2026",
  appTitle: "Waking Life 2026 - Timetable",
  manifestName: "Waking Life 2026 Timetable",
  siteUrl: "https://wakinglife.netlify.app",
  description: `Unofficial fan-made festival timetable and lineup for Waking Life 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE}). Not affiliated with Waking Life organizers.`,
  manifestDescription: `Unofficial fan-made festival timetable and lineup for Waking Life 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE}) - Works offline!`,
  seoKeywords: [
    "Waking Life 2026",
    "Waking Life timetable",
    "Waking Life lineup",
    "Waking Life festival 2026",
    "Waking Life schedule",
    "who is playing Waking Life",
    "Waking Life Crato",
    "Praia stage",
    "Cochilo stage",
    "Floresta stage",
    "Moonscreen stage",
    "Outro Lado stage",
    "Suna stage",
    "Tudo Bem stage",
    "Apuro stage",
  ] as const,
  officialDateRange: FESTIVAL_OFFICIAL_DATE_RANGE,
  officialStartDateTime: "2026-06-16T00:00:00",
  nextEditionYear: 2027,
  beerDonationUrl: "https://revolut.me/frank_frank",
  programStartDay: "tuesday" as ProgramDayId,
  programStartTime: "16:00",
  dataVersion: "2026.2.4",
  cacheVersion: "v5",
} as const
