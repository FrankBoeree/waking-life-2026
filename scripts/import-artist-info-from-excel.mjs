import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const ROOT = new URL("..", import.meta.url)
const DEFAULT_EXCEL =
  "/Users/frank@sodastudio.nl/Downloads/waking_life_timetable final.xlsx"
const TIMETABLE_PATH = new URL("public/festival-data.json", ROOT)
const EXISTING_DB_PATH = new URL("data/artist-info-db.ts", ROOT)
const OUTPUT_PATH = new URL("data/artist-info-db.ts", ROOT)

/** Excel artist name → timetable slot name */
const TIMETABLE_NAME_OVERRIDES = {
  elemental: "e l e m e n t a l",
  "Coco María": "Coco Maria",
  "Charlemagne Palestine, Oren Ambarchi & Daniel O'Sullivan present 'KKAARRREENNIINNAA'":
    "Charlemagne Palestine, Oren Ambarchi & Daniel O'Sullivan present KKAARREENNIINNAA",
  "Heith & Tarawangsawelas present Duori":
    "Heith & Tarawangawelas present Duori",
  "Dj Trystero": "DJ Trystero",
  "Vera, DJ Dustin, Mimi, Vuur, …": "Vera, DJ Dustin, Mimi, Vuur, ...",
}

function normalizeForMatch(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function countryCodeToFlag(countryCode) {
  const code = String(countryCode || "")
    .split(/[/|,]/)[0]
    .trim()
    .toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return undefined
  return code.replace(/./g, (char) =>
    String.fromCodePoint(127397 + char.charCodeAt(0))
  )
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

function parseGenreTags(genre) {
  if (!genre || !String(genre).trim()) return []
  return String(genre)
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseLive(value) {
  if (value === undefined || value === null || value === "") return undefined
  return String(value).trim().toLowerCase() === "yes"
}

function getResidentAdvisorUrl(sourceUrl, name) {
  if (sourceUrl && /ra\.co/i.test(sourceUrl)) return sourceUrl
  return getResidentAdvisorSearchUrl(name)
}

async function readExcelRows(excelPath) {
  const { stdout } = await execFileAsync(
    "npx",
    ["--yes", "xlsx-cli", excelPath, "--json"],
    { maxBuffer: 1024 * 1024 * 8 }
  )
  return JSON.parse(stdout)
}

function parseExistingDatabase(source) {
  const match = source.match(
    /export const artistInfoDatabase: Record<string, ArtistInfo> = (\{[\s\S]*\})\s*$/
  )
  if (!match) return {}
  return JSON.parse(match[1])
}

function timetableNameForExcelRow(row) {
  const excelName = row.Name?.trim()
  if (!excelName) return undefined
  return TIMETABLE_NAME_OVERRIDES[excelName] || excelName
}

function mergeArtistRows(rows) {
  const descriptions = [
    ...new Set(rows.map((row) => String(row.Description || "").trim()).filter(Boolean)),
  ]
  const genres = [
    ...new Set(
      rows.flatMap((row) => parseGenreTags(row.Genre)).filter(Boolean)
    ),
  ]
  const liveValues = rows.map((row) => parseLive(row.Live)).filter((v) => v !== undefined)
  const isLive = liveValues.length > 0 ? liveValues.some(Boolean) : undefined

  const bestRow =
    rows.find((row) => String(row.Description || "").trim()) ||
    rows.find((row) => row.Genre) ||
    rows.find((row) => row["Source URL"]) ||
    rows[0]

  let bio = descriptions[0] || ""
  if (descriptions.length > 1) {
    bio = [descriptions[0], descriptions.slice(1).join(" ")].filter(Boolean).join(" ")
  }

  const country = bestRow["Origin Country"]?.trim() || undefined
  const countryCode = bestRow["Country Code"]?.trim() || undefined
  const sourceUrl = bestRow["Source URL"]?.trim() || undefined
  const sourceLabel = bestRow.Source?.trim() || undefined
  const timetableName = timetableNameForExcelRow(bestRow)

  const record = {
    bio,
    tags: genres,
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorUrl(sourceUrl, timetableName || bestRow.Name),
    ...(sourceLabel ? { sourceLabel } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(country ? { country } : {}),
    ...(countryCode ? { countryCode } : {}),
    ...(countryCode ? { flag: countryCodeToFlag(countryCode) } : {}),
    ...(isLive !== undefined ? { isLive } : {}),
  }

  return record
}

function mergeArtistInfo(primary, secondary, { allowSecondaryBio = true } = {}) {
  if (!secondary) return primary
  if (!primary) return secondary

  const tags = [...new Set([...(primary.tags || []), ...(secondary.tags || [])])]
  const primaryBio = primary.bio?.trim() || ""
  const secondaryBio = secondary.bio?.trim() || ""

  return {
    bio: primaryBio || (allowSecondaryBio ? secondaryBio : "") || "",
    tags,
    labels: primary.labels?.length ? primary.labels : secondary.labels || [],
    festivals: primary.festivals?.length ? primary.festivals : secondary.festivals || [],
    residentAdvisorUrl:
      /ra\.co/i.test(primary.residentAdvisorUrl || "")
        ? primary.residentAdvisorUrl
        : secondary.residentAdvisorUrl || primary.residentAdvisorUrl,
    sourceLabel: primary.sourceLabel || secondary.sourceLabel,
    sourceUrl: primary.sourceUrl || secondary.sourceUrl,
    country: primary.country || secondary.country,
    countryCode: primary.countryCode || secondary.countryCode,
    flag: primary.flag || secondary.flag,
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
    const timetableName = timetableNameForExcelRow(row)
    if (!timetableName) continue

    const existing = rowsByTimetableName.get(timetableName) || []
    existing.push(row)
    rowsByTimetableName.set(timetableName, existing)
  }

  const merged = new Map()
  for (const [name, artistRows] of rowsByTimetableName.entries()) {
    merged.set(name, mergeArtistRows(artistRows))
  }

  const byNormalized = new Map()
  for (const [name, info] of merged.entries()) {
    const normalized = normalizeForMatch(name)
    const existing = byNormalized.get(normalized)
    byNormalized.set(
      normalized,
      existing ? mergeArtistInfo(existing, info) : info
    )
  }

  return { merged, byNormalized }
}

function getTimetableArtistNames(timetable) {
  return Array.from(
    new Set(
      timetable
        .filter((slot) => !slot.placeholderKind)
        .map((slot) => slot.name)
    )
  ).sort((a, b) => a.localeCompare(b))
}

function lookupExcelInfo(timetableName, lookup) {
  const exact = lookup.merged.get(timetableName)
  const normalized = lookup.byNormalized.get(normalizeForMatch(timetableName))
  return mergeArtistInfo(exact, normalized)
}

function fallbackFromExisting(name, existingDb) {
  if (existingDb[name]) return existingDb[name]

  const normalized = normalizeForMatch(name)
  for (const [dbName, info] of Object.entries(existingDb)) {
    if (normalizeForMatch(dbName) === normalized) return info
  }

  return {
    bio: "",
    tags: [],
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorSearchUrl(name),
    sourceLabel: "Local fallback",
  }
}

function toTs(records) {
  return `import type { ArtistInfo } from "@/lib/artist-info"

// Generated by scripts/import-artist-info-from-excel.mjs from organizer timetable spreadsheet.
// Rerun: npm run import:artist-info -- "/path/to/waking_life_timetable final.xlsx"
export const artistInfoDatabase: Record<string, ArtistInfo> = ${JSON.stringify(records, null, 2)}
`
}

const excelPath = process.argv[2] || DEFAULT_EXCEL
const excelRows = await readExcelRows(excelPath)
const timetable = JSON.parse(await readFile(TIMETABLE_PATH, "utf8")).timetable
const existingDb = parseExistingDatabase(await readFile(EXISTING_DB_PATH, "utf8"))
const lookup = buildExcelLookup(excelRows)
const artistNames = getTimetableArtistNames(timetable)
const records = {}

let importedFromExcel = 0
let keptFromExisting = 0
let missingFromExcel = []

for (const name of artistNames) {
  const excelInfo = lookupExcelInfo(name, lookup)
  const hasExcelContent =
    excelInfo &&
    (excelInfo.bio?.trim() ||
      excelInfo.tags?.length ||
      excelInfo.isLive !== undefined ||
      excelInfo.sourceUrl)

  if (hasExcelContent) {
    records[name] = mergeArtistInfo(
      excelInfo,
      fallbackFromExisting(name, existingDb),
      { allowSecondaryBio: false }
    )
    importedFromExcel += 1
  } else {
    records[name] = fallbackFromExisting(name, existingDb)
    keptFromExisting += 1
    missingFromExcel.push(name)
  }
}

await writeFile(OUTPUT_PATH, toTs(records), "utf8")

console.log(`Wrote ${OUTPUT_PATH.pathname}`)
console.log(`Artists in timetable: ${artistNames.length}`)
console.log(`Imported from Excel: ${importedFromExcel}`)
console.log(`Kept from existing DB (not in Excel): ${keptFromExisting}`)
if (missingFromExcel.length > 0) {
  console.log("Not found in Excel:")
  for (const name of missingFromExcel) {
    console.log(`  - ${name}`)
  }
}
