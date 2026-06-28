import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const ROOT = new URL("..", import.meta.url)
const DEFAULT_EXCEL =
  "/Users/frank@sodastudio.nl/Downloads/Dekmantel Schedule with short bios and soundcloud.xlsx"
const BIO_SHEET = "Artist biographies"
const TIMETABLE_PATH = new URL("public/festival-data.json", ROOT)
const OUTPUT_PATH = new URL("data/artist-info-db.ts", ROOT)

/** Timetable slot name → Excel lookup name */
const TIMETABLE_NAME_OVERRIDES = {
  "At Dawn: DJ Sprinkles' Deeperama": "DJ Sprinkles' Deeperama",
  "At Dawn: James Holden & Surgeon live": "James Holden & Surgeon live",
  "At Dawn: Kuniyuki & Satoshi Tomiie live": "Kuniyuki & Satoshi Tomiie live",
  "At Dawn: Eris Drew's Mystery of the Motherbeat": "Eris Drew's Mystery of the Motherbeat",
  "At Dawn: Colin Benders": "Colin Benders",
  "At Dawn: Jeff Mills": "Jeff Mills",
  "At Dawn: Jane Fitz presents Morning Colours": "Jane Fitz presents Morning Colours",
  "At Dawn: Sampha DJ set": "Sampha DJ set",
  "At Dawn: Channel One": "Channel One",
  "At Dawn: RA In Conversation": "RA In Conversation",
  "At Dawn:RA In Conversation": "RA In Conversation",
  "Cari Lekebusch presents Vector": "Cari Lekebusch presents Vector",
  "Gigi FM & Jako Jako": "Gigi FM & Jako Jako",
  "Honduku": "Honduku",
  "Katatonic Silention": "Katatonic Silention",
  "Ron Trent presents La Marr w/ Paolo Color live": "Ron Trent presents La Marr w/ Paolo Color live",
  "Underground Resistance presents Depth Charge featuring Saul Williams":
    "Underground Resistance presents Depth Charge featuring Saul Williams",
}

function stripAtDawnPrefix(name) {
  return String(name || "")
    .replace(/^at dawn:\s*/i, "")
    .trim()
}

function normalizeForMatch(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function cleanArtistQuery(name) {
  return name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+feat\..*$/i, "")
    .replace(/\s+presents.*$/i, "")
    .replace(/\s+pres\..*$/i, "")
    .replace(/\s*&\s*/g, " ")
    .replace(/\s*,.*$/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function getResidentAdvisorSearchUrl(name) {
  return `https://ra.co/search?search=${encodeURIComponent(cleanArtistQuery(name))}`
}

function getResidentAdvisorUrl(sourceUrl, name) {
  if (sourceUrl && /ra\.co/i.test(sourceUrl)) return sourceUrl
  return getResidentAdvisorSearchUrl(name)
}

function detectLiveFromName(name) {
  const lower = String(name || "").toLowerCase()
  if (/\blive\b/.test(lower) || /\bhybrid\b/.test(lower)) return true
  if (/\bdj set\b/.test(lower) || /\bdnb set\b/.test(lower)) return false
  return undefined
}

async function readBioSheet(excelPath) {
  const { stdout } = await execFileAsync(
    "npx",
    ["--yes", "xlsx-cli", excelPath, "--sheet", BIO_SHEET, "--json"],
    { maxBuffer: 1024 * 1024 * 8 },
  )
  return JSON.parse(stdout)
}

function timetableNameForExcelRow(row) {
  const matched = row["Matched Dekmantel name"]?.trim()
  const artist = row.Artist?.trim()
  const lookupName = matched || artist
  if (!lookupName) return undefined
  return TIMETABLE_NAME_OVERRIDES[lookupName] || lookupName
}

function mergeArtistRows(rows) {
  const bios = [
    ...new Set(
      rows
        .flatMap((row) => [
          String(row["Factual bio"] || "").trim(),
          String(row.Biography || "").trim(),
        ])
        .filter(Boolean),
    ),
  ]

  const bestRow =
    rows.find((row) => String(row["Factual bio"] || "").trim()) ||
    rows.find((row) => String(row.Biography || "").trim()) ||
    rows.find((row) => row["Source URL"]) ||
    rows[0]

  const timetableName = timetableNameForExcelRow(bestRow)
  const sourceUrl = bestRow["Source URL"]?.trim() || undefined
  const soundcloudUrl = bestRow["SoundCloud URL"]?.trim() || undefined
  const isLive =
    detectLiveFromName(timetableName) ??
    detectLiveFromName(bestRow.Artist) ??
    detectLiveFromName(bestRow["Matched Dekmantel name"])

  return {
    bio: bios[0] || "",
    tags: [],
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorUrl(sourceUrl, timetableName || bestRow.Artist),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(soundcloudUrl ? { soundcloudUrl } : {}),
    ...(isLive !== undefined ? { isLive } : {}),
  }
}

function mergeArtistInfo(primary, secondary, { allowSecondaryBio = true } = {}) {
  if (!secondary) return primary
  if (!primary) return secondary

  const primaryBio = primary.bio?.trim() || ""
  const secondaryBio = secondary.bio?.trim() || ""

  return {
    bio: primaryBio || (allowSecondaryBio ? secondaryBio : "") || "",
    tags: [...new Set([...(primary.tags || []), ...(secondary.tags || [])])],
    labels: primary.labels?.length ? primary.labels : secondary.labels || [],
    festivals: primary.festivals?.length ? primary.festivals : secondary.festivals || [],
    residentAdvisorUrl:
      /ra\.co/i.test(primary.residentAdvisorUrl || "")
        ? primary.residentAdvisorUrl
        : secondary.residentAdvisorUrl || primary.residentAdvisorUrl,
    sourceUrl: primary.sourceUrl || secondary.sourceUrl,
    soundcloudUrl: primary.soundcloudUrl || secondary.soundcloudUrl,
    isLive:
      primary.isLive === true || secondary.isLive === true
        ? true
        : primary.isLive === false || secondary.isLive === false
          ? false
          : undefined,
  }
}

function buildExcelLookup(rows) {
  const rowsByTimetableName = new Map()

  for (const row of rows) {
    const keys = new Set(
      [row.Artist, row["Matched Dekmantel name"], timetableNameForExcelRow(row)]
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    )

    for (const key of keys) {
      const existing = rowsByTimetableName.get(key) || []
      existing.push(row)
      rowsByTimetableName.set(key, existing)

      const stripped = stripAtDawnPrefix(key)
      if (stripped && stripped !== key) {
        const strippedExisting = rowsByTimetableName.get(stripped) || []
        strippedExisting.push(row)
        rowsByTimetableName.set(stripped, strippedExisting)
      }
    }
  }

  const merged = new Map()
  for (const [name, artistRows] of rowsByTimetableName.entries()) {
    merged.set(name, mergeArtistRows(artistRows))
  }

  const byNormalized = new Map()
  for (const [name, info] of merged.entries()) {
    const normalized = normalizeForMatch(name)
    const existing = byNormalized.get(normalized)
    byNormalized.set(normalized, existing ? mergeArtistInfo(existing, info) : info)
  }

  return { merged, byNormalized }
}

function getTimetableArtistNames(timetable) {
  return Array.from(
    new Set(
      timetable
        .filter((slot) => !slot.placeholderKind)
        .map((slot) => slot.name),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

function lookupExcelInfo(timetableName, lookup) {
  const candidates = [
    timetableName,
    TIMETABLE_NAME_OVERRIDES[timetableName],
    stripAtDawnPrefix(timetableName),
    stripAtDawnPrefix(TIMETABLE_NAME_OVERRIDES[timetableName] || ""),
  ].filter(Boolean)

  let result = null
  for (const candidate of candidates) {
    const exact = lookup.merged.get(candidate)
    const normalized = lookup.byNormalized.get(normalizeForMatch(candidate))
    result = mergeArtistInfo(result, mergeArtistInfo(exact, normalized))
  }

  return result
}

function fallbackArtistInfo(name) {
  const isLive = detectLiveFromName(name)
  return {
    bio: "",
    tags: [],
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorSearchUrl(name),
    ...(isLive !== undefined ? { isLive } : {}),
  }
}

function toTs(records) {
  return `import type { ArtistInfo } from "@/lib/artist-info"

// Generated by scripts/import-artist-info-from-excel.mjs from Dekmantel artist biographies sheet.
// Rerun: npm run import:artist-info -- "/path/to/Dekmantel Schedule.xlsx"
export const artistInfoDatabase: Record<string, ArtistInfo> = ${JSON.stringify(records, null, 2)}
`
}

const excelPath = process.argv[2] || DEFAULT_EXCEL
const excelRows = await readBioSheet(excelPath)
const timetable = JSON.parse(await readFile(TIMETABLE_PATH, "utf8")).timetable
const lookup = buildExcelLookup(excelRows)
const artistNames = getTimetableArtistNames(timetable)
const records = {}

let importedFromExcel = 0
let missingFromExcel = []

for (const name of artistNames) {
  const excelInfo = lookupExcelInfo(name, lookup)
  const hasExcelContent =
    excelInfo &&
    (excelInfo.bio?.trim() || excelInfo.sourceUrl || excelInfo.soundcloudUrl)

  if (hasExcelContent) {
    records[name] = mergeArtistInfo(excelInfo, fallbackArtistInfo(name), {
      allowSecondaryBio: false,
    })
    importedFromExcel += 1
  } else {
    records[name] = fallbackArtistInfo(name)
    missingFromExcel.push(name)
  }
}

await writeFile(OUTPUT_PATH, toTs(records), "utf8")

console.log(`Wrote ${OUTPUT_PATH.pathname}`)
console.log(`Artists in timetable: ${artistNames.length}`)
console.log(`Imported from Excel: ${importedFromExcel}`)
if (missingFromExcel.length > 0) {
  console.log("Not found in Excel:")
  for (const name of missingFromExcel) {
    console.log(`  - ${name}`)
  }
}
