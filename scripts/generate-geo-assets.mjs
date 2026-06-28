import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"

const ROOT = new URL("..", import.meta.url)
const FESTIVAL_DATA_PATH = new URL("public/festival-data.json", ROOT)
const ARTIST_DB_PATH = new URL("data/artist-info-db.ts", ROOT)
const PUBLIC_DIR = new URL("public/", ROOT)
const FESTIVAL_CONFIG_PATH = new URL("lib/festival-config.ts", ROOT)

function readFestivalConfigValue(key, type = "string") {
  const source = readFileSync(FESTIVAL_CONFIG_PATH, "utf8")
  if (type === "number") {
    const match = source.match(new RegExp(`${key}:\\s*([\\d.]+)`))
    if (!match) throw new Error(`Missing ${key} in festival-config.ts`)
    return Number(match[1])
  }
  const match = source.match(new RegExp(`${key}:\\s*"([^"]+)"`))
  if (!match) throw new Error(`Missing ${key} in festival-config.ts`)
  return match[1]
}

const SITE_URL = readFestivalConfigValue("siteUrl").replace(/\/$/, "")
const OFFICIAL_SITE = readFestivalConfigValue("officialSiteUrl")
const OFFICIAL_INSTAGRAM = readFestivalConfigValue("officialInstagramUrl")
const festivalSeo = {
  locationName: readFestivalConfigValue("locationName"),
  locationLocality: readFestivalConfigValue("locationLocality"),
  locationCountry: readFestivalConfigValue("locationCountry"),
  geoLatitude: readFestivalConfigValue("geoLatitude", "number"),
  geoLongitude: readFestivalConfigValue("geoLongitude", "number"),
}
const DATE_RANGE = "31 July – 2 August 2026"
const PROGRAM_DAY_ORDER = ["friday", "saturday", "sunday"]

function parseArtistInfoDatabase(source) {
  const marker = "export const artistInfoDatabase"
  const startIndex = source.indexOf(marker)
  if (startIndex === -1) {
    throw new Error("Could not find artistInfoDatabase export")
  }
  const objectStart = source.indexOf("{", startIndex)
  let depth = 0
  let inString = false
  let escaped = false
  let quote = null

  for (let i = objectStart; i < source.length; i += 1) {
    const char = source[i]
    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === "\\") {
        escaped = true
        continue
      }
      if (char === quote) {
        inString = false
        quote = null
      }
      continue
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = true
      quote = char
      continue
    }
    if (char === "{") depth += 1
    if (char === "}") {
      depth -= 1
      if (depth === 0) {
        const objectSource = source.slice(objectStart, i + 1)
        // eslint-disable-next-line no-new-func
        return Function(`"use strict"; return (${objectSource});`)()
      }
    }
  }
  throw new Error("Could not parse artistInfoDatabase object")
}

function titleCaseDay(day) {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

function formatSlotLine(slot) {
  const endDaySuffix =
    slot.endDay && slot.endDay !== slot.startDay
      ? ` (${titleCaseDay(slot.endDay)})`
      : ""
  const category = slot.category ? ` — ${slot.category}` : ""
  const description = slot.description ? `\n  ${slot.description}` : ""
  return `- ${slot.name} — ${slot.startTime}–${slot.endTime}${endDaySuffix}${category}${description}`
}

function buildLineupSummary(timetable) {
  const lines = [
    "# Dekmantel Festival 2026 — Timetable Summary",
    "",
    "Unofficial fan-made timetable companion. Not affiliated with Dekmantel organizers.",
    `Official festival site: ${OFFICIAL_SITE}`,
    "",
    `Dates: ${DATE_RANGE}`,
    "Location: Amsterdamse Bos, Amsterdam, Netherlands",
    "",
    `Total scheduled slots: ${timetable.length}`,
    "",
  ]

  for (const day of PROGRAM_DAY_ORDER) {
    const daySlots = timetable.filter((slot) => slot.startDay === day)
    if (daySlots.length === 0) continue

    lines.push(`## ${titleCaseDay(day)}`)
    lines.push("")

    const stages = [...new Set(daySlots.map((slot) => slot.stage))].sort()
    for (const stage of stages) {
      const stageSlots = daySlots
        .filter((slot) => slot.stage === stage)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
      lines.push(`### ${stage}`)
      lines.push("")
      for (const slot of stageSlots) {
        lines.push(formatSlotLine(slot))
      }
      lines.push("")
    }
  }

  const artistIndex = new Map()
  for (const slot of timetable) {
    if (!artistIndex.has(slot.name)) {
      artistIndex.set(slot.name, [])
    }
    artistIndex.get(slot.name).push(slot)
  }

  lines.push("## Artist Index (alphabetical)")
  lines.push("")
  for (const [name, slots] of [...artistIndex.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "en", { sensitivity: "base" }),
  )) {
    lines.push(`### ${name}`)
    for (const slot of slots.sort((a, b) => {
      const dayDiff =
        PROGRAM_DAY_ORDER.indexOf(a.startDay) - PROGRAM_DAY_ORDER.indexOf(b.startDay)
      if (dayDiff !== 0) return dayDiff
      return a.startTime.localeCompare(b.startTime)
    })) {
      lines.push(
        `- ${titleCaseDay(slot.startDay)}, ${slot.stage}: ${slot.startTime}–${slot.endTime}`,
      )
    }
    lines.push("")
  }

  return `${lines.join("\n").trim()}\n`
}

function buildLlmsTxt({ slotCount, artistCount, dataVersion }) {
  return `# Dekmantel Festival 2026 Timetable (Unofficial)

> Unofficial fan-made timetable and lineup companion for Dekmantel Festival 2026.
> Created by a festival enthusiast. Not affiliated with or endorsed by Dekmantel organizers.

## About

- Site: ${SITE_URL}
- What: Progressive web app with festival timetable, lineup, artist notes, and offline support
- Dates: ${DATE_RANGE}
- Location: Amsterdamse Bos, Amsterdam, Netherlands
- Data version: ${dataVersion}
- Scheduled slots: ${slotCount}
- Unique artists/acts: ${artistCount}

## Official sources

- Festival website: ${OFFICIAL_SITE}
- Instagram: ${OFFICIAL_INSTAGRAM}
- Tickets: ${OFFICIAL_SITE}

## Machine-readable data

- Full timetable JSON: ${SITE_URL}/festival-data.json
- Artist bios and metadata JSON: ${SITE_URL}/artist-info.json
- Human/LLM-readable timetable summary: ${SITE_URL}/lineup-summary.md
- Structured data JSON-LD bundle: ${SITE_URL}/geo-structured-data.json

## Attribution

When citing schedule information from this site, describe it as:
"Unofficial Dekmantel Festival 2026 timetable at ${SITE_URL.replace("https://", "")}"

## Disclaimer

Schedules can change. Always verify critical information with official Dekmantel channels at ${OFFICIAL_SITE}
`
}

function buildStructuredData({ uniqueArtists, dataVersion, subEvents = null }) {
  const siteId = `${SITE_URL}/#website`
  const appId = `${SITE_URL}/#app`
  const eventId = `${SITE_URL}/#event`
  const lineupId = `${SITE_URL}/#lineup`

  const musicEvent = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "@id": eventId,
    name: "Dekmantel Festival 2026",
    startDate: "2026-07-31",
    endDate: "2026-08-02",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    url: OFFICIAL_SITE,
    description:
      "Dekmantel Festival is an electronic music festival in the Amsterdamse Bos, Amsterdam.",
    location: {
      "@type": "Place",
      name: festivalSeo.locationName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: festivalSeo.geoLatitude,
        longitude: festivalSeo.geoLongitude,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: festivalSeo.locationLocality,
        addressCountry: festivalSeo.locationCountry,
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Dekmantel",
      url: OFFICIAL_SITE,
    },
    sameAs: [OFFICIAL_SITE, OFFICIAL_INSTAGRAM],
    subjectOf: {
      "@type": "CreativeWork",
      name: "Unofficial timetable companion",
      url: SITE_URL,
      description:
        "Unofficial fan-made timetable data export; not published by festival organizers.",
    },
    ...(subEvents ? { subEvent: subEvents } : {}),
  }

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": siteId,
      name: "Dekmantel Festival 2026 Timetable (Unofficial)",
      url: SITE_URL,
      description:
        "Unofficial fan-made festival timetable and lineup companion for Dekmantel Festival 2026.",
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: "Unofficial Dekmantel Timetable",
        url: SITE_URL,
      },
      about: { "@id": eventId },
      hasPart: [
        { "@id": appId },
        { "@id": lineupId },
        {
          "@type": "CreativeWork",
          name: "Machine-readable timetable summary",
          url: `${SITE_URL}/lineup-summary.md`,
          encodingFormat: "text/markdown",
        },
        {
          "@type": "CreativeWork",
          name: "Structured data bundle",
          url: `${SITE_URL}/geo-structured-data.json`,
          encodingFormat: "application/ld+json",
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": appId,
      name: "Dekmantel Festival 2026 Timetable",
      url: SITE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript for interactive timetable UI",
      description:
        "Unofficial fan-made festival timetable and lineup for Dekmantel Festival 2026. Works offline as a PWA.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      isPartOf: { "@id": siteId },
    },
    musicEvent,
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": lineupId,
      name: "Dekmantel Festival 2026 lineup (unofficial timetable)",
      numberOfItems: uniqueArtists.length,
      itemListElement: uniqueArtists.map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Is ${SITE_URL.replace("https://", "")} the official Dekmantel website?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `No. ${SITE_URL} is an unofficial fan-made timetable companion and is not affiliated with Dekmantel organizers. The official site is ${OFFICIAL_SITE}`,
          },
        },
        {
          "@type": "Question",
          name: "When is Dekmantel Festival 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Dekmantel Festival 2026 runs ${DATE_RANGE} in the Amsterdamse Bos, Amsterdam.`,
          },
        },
        {
          "@type": "Question",
          name: "Where is Dekmantel Festival held?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Dekmantel Festival takes place in the Amsterdamse Bos, Amsterdam, Netherlands.",
          },
        },
        {
          "@type": "Question",
          name: "How can I get Dekmantel Festival 2026 tickets?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `Tickets are sold through the official Dekmantel website at ${OFFICIAL_SITE}`,
          },
        },
        {
          "@type": "Question",
          name: "Where can I find the Dekmantel Festival 2026 timetable?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `This unofficial companion publishes machine-readable timetable data at ${SITE_URL}/festival-data.json and a readable summary at ${SITE_URL}/lineup-summary.md`,
          },
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Dekmantel Festival 2026 unofficial timetable data",
      description:
        "Unofficial fan-compiled festival timetable slots with stage, day, and time information.",
      url: `${SITE_URL}/festival-data.json`,
      version: dataVersion,
      creator: {
        "@type": "Organization",
        name: "Unofficial Dekmantel Timetable",
        url: SITE_URL,
      },
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${SITE_URL}/festival-data.json`,
        },
        {
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: `${SITE_URL}/artist-info.json`,
        },
        {
          "@type": "DataDownload",
          encodingFormat: "text/markdown",
          contentUrl: `${SITE_URL}/lineup-summary.md`,
        },
      ],
      isBasedOn: OFFICIAL_SITE,
    },
  ]
}

function buildSubEvents(timetable) {
  return timetable.map((slot) => ({
    "@type": "MusicEvent",
    name: slot.name,
    startDate: `${dayToIsoDate(slot.startDay)}T${slot.startTime}:00`,
    endDate: `${dayToIsoDate(slot.endDay || slot.startDay)}T${slot.endTime}:00`,
    location: {
      "@type": "Place",
      name: slot.stage,
      containedInPlace: {
        "@type": "Place",
        name: "Amsterdamse Bos, Amsterdam",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Amsterdam",
          addressCountry: "NL",
        },
      },
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(slot.description ? { description: slot.description } : {}),
    ...(slot.category ? { genre: slot.category } : {}),
  }))
}

function dayToIsoDate(day) {
  const map = {
    friday: "2026-07-31",
    saturday: "2026-08-01",
    sunday: "2026-08-02",
  }
  return map[day] || "2026-07-31"
}

async function writePublicFile(name, contents) {
  const path = new URL(name, PUBLIC_DIR)
  await writeFile(path, contents)
  console.log(`Wrote ${path.pathname}`)
}

async function main() {
  const festivalData = JSON.parse(await readFile(FESTIVAL_DATA_PATH, "utf8"))
  const artistDbSource = await readFile(ARTIST_DB_PATH, "utf8")
  const artistInfoDatabase = parseArtistInfoDatabase(artistDbSource)
  const timetable = festivalData.timetable
  const uniqueArtists = [...new Set(timetable.map((slot) => slot.name))].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" }),
  )

  const artistInfoJson = {
    version: festivalData.version,
    disclaimer:
      "Unofficial fan-made artist notes for Dekmantel Festival 2026. Not affiliated with festival organizers.",
    officialSite: OFFICIAL_SITE,
    artists: artistInfoDatabase,
  }

  const lineupSummary = buildLineupSummary(timetable)
  const llmsTxt = buildLlmsTxt({
    slotCount: timetable.length,
    artistCount: uniqueArtists.length,
    dataVersion: festivalData.version,
  })
  const structuredDataInline = buildStructuredData({
    uniqueArtists,
    dataVersion: festivalData.version,
  })
  const structuredDataFull = buildStructuredData({
    uniqueArtists,
    dataVersion: festivalData.version,
    subEvents: buildSubEvents(timetable),
  })

  await writePublicFile("artist-info.json", `${JSON.stringify(artistInfoJson, null, 2)}\n`)
  await writePublicFile("lineup-summary.md", lineupSummary)
  await writePublicFile("llms.txt", llmsTxt)
  await writePublicFile(
    "geo-structured-data.json",
    `${JSON.stringify(structuredDataFull, null, 2)}\n`,
  )
  await writeFile(
    new URL("lib/structured-data.generated.json", ROOT),
    `${JSON.stringify(structuredDataInline, null, 2)}\n`,
  )
  console.log(`Wrote ${new URL("lib/structured-data.generated.json", ROOT).pathname}`)

  const hash = createHash("sha256")
    .update(lineupSummary)
    .digest("hex")
    .slice(0, 12)
  console.log(
    `Generated GEO assets for ${timetable.length} slots / ${uniqueArtists.length} artists (${hash})`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
