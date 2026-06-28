export const PROGRAM_DAY_ORDER = ["friday", "saturday", "sunday"] as const

export type ProgramDayId = (typeof PROGRAM_DAY_ORDER)[number]

export const FESTIVAL_OFFICIAL_DATE_RANGE = "31 July – 2 August 2026"

export const FESTIVAL_CONFIG = {
  year: 2026,
  title: "Dekmantel Festival 2026",
  appTitle: "Dekmantel Festival 2026 - Timetable",
  manifestName: "Dekmantel Festival 2026 Timetable",
  siteUrl: "https://dekmantel.netlify.app",
  officialSiteUrl: "https://dekmantelfestival.com/",
  officialInstagramUrl: "https://www.instagram.com/dekmantelfestival/",
  locationName: "Amsterdamse Bos",
  locationLocality: "Amsterdam",
  locationCountry: "NL",
  geoLatitude: 52.308,
  geoLongitude: 4.833,
  description: `Unofficial fan-made festival timetable and lineup for Dekmantel Festival 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE}). Not affiliated with Dekmantel organizers.`,
  manifestDescription: `Unofficial fan-made festival timetable and lineup for Dekmantel Festival 2026 (${FESTIVAL_OFFICIAL_DATE_RANGE}) - Works offline!`,
  seoKeywords: [
    "Dekmantel Festival 2026",
    "Dekmantel timetable",
    "Dekmantel lineup",
    "Dekmantel schedule",
    "who is playing Dekmantel",
    "Dekmantel Amsterdamse Bos",
    "The Loop stage",
    "UFO I stage",
    "UFO II stage",
    "The Nest stage",
    "Selectors stage",
    "Greenhouse stage",
    "Radar stage",
    "Dekmantel at Dawn",
  ] as const,
  officialDateRange: FESTIVAL_OFFICIAL_DATE_RANGE,
  officialStartDateTime: "2026-07-31T11:00:00",
  nextEditionYear: 2027,
  showTipDonation: false,
  beerDonationUrl: "https://revolut.me/frank_frank",
  programStartDay: "friday" as ProgramDayId,
  programStartTime: "11:00",
  dataVersion: "2026.1.0",
  cacheVersion: "v1",
} as const

/** Matches html/body background — used for theme-color and iOS status bar. */
export const APP_SURFACE_COLORS = {
  light: "#f5f0e8",
  dark: "#0a0a0a",
} as const
