import { execFile } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const ROOT = new URL("..", import.meta.url)
const TIMETABLE_PATH = new URL("data/timetable.ts", ROOT)
const OUTPUT_PATH = new URL("data/artist-info-db.ts", ROOT)
const USER_AGENT = "waking-life-2026-local-import/1.0"

const COUNTRY_NAMES = {
  AR: "Argentina",
  AT: "Austria",
  AU: "Australia",
  BE: "Belgium",
  BR: "Brazil",
  CA: "Canada",
  CH: "Switzerland",
  CL: "Chile",
  CO: "Colombia",
  DE: "Germany",
  DK: "Denmark",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  GR: "Greece",
  ID: "Indonesia",
  IE: "Ireland",
  IN: "India",
  IT: "Italy",
  JP: "Japan",
  KE: "Kenya",
  KR: "South Korea",
  MX: "Mexico",
  NL: "Netherlands",
  NO: "Norway",
  PT: "Portugal",
  RO: "Romania",
  SE: "Sweden",
  TR: "Turkey",
  UG: "Uganda",
  US: "United States",
  ZA: "South Africa",
}

const AREA_COUNTRY_CODES = {
  Amsterdam: "NL",
  Antwerp: "BE",
  Athens: "GR",
  Barcelona: "ES",
  Berlin: "DE",
  Bogota: "CO",
  "Buenos Aires": "AR",
  Chicago: "US",
  Detroit: "US",
  Dublin: "IE",
  Istanbul: "TR",
  Jakarta: "ID",
  London: "GB",
  Lisbon: "PT",
  Madrid: "ES",
  Melbourne: "AU",
  Montreal: "CA",
  "New York": "US",
  "New York City": "US",
  Paris: "FR",
  "San Francisco": "US",
  Seoul: "KR",
  Stockholm: "SE",
  Tokyo: "JP",
  Toronto: "CA",
  Vienna: "AT",
}

const KNOWN_FESTIVALS = [
  "Atonal",
  "Dekmantel",
  "Dimensions",
  "Glastonbury",
  "Le Guess Who?",
  "MUTEK",
  "Nuits Sonores",
  "Primavera Sound",
  "Rewire",
  "Sónar",
  "Sonar",
  "Unsound",
]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function countryCodeToFlag(countryCode) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
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

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function isReliableWikipediaMatch(name, summary) {
  const query = normalizeForMatch(cleanArtistQuery(name))
  const title = normalizeForMatch(summary.title || "")
  const extract = normalizeForMatch(summary.extract || "")

  return Boolean(query && (title.includes(query) || extract.includes(query)))
}

function sentenceLimit(text, maxSentences = 4) {
  const compact = text.replace(/\s+/g, " ").trim()
  const sentences = compact.match(/[^.!?]+[.!?]+/g)

  return sentences ? sentences.slice(0, maxSentences).join(" ").trim() : compact
}

function formatTags(tags) {
  if (tags.length === 0) return ""
  if (tags.length === 1) return tags[0]
  return `${tags.slice(0, -1).join(", ")} and ${tags[tags.length - 1]}`
}

function uniqueCompact(values, limit = 4) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  ).slice(0, limit)
}

function getResidentAdvisorSearchUrl(name) {
  return `https://ra.co/search?search=${encodeURIComponent(cleanArtistQuery(name))}`
}

async function curlJson(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-L", "-s", "--max-time", "20", "-A", USER_AGENT, url],
    { maxBuffer: 1024 * 1024 * 8 }
  )

  if (!stdout.trim()) {
    return undefined
  }

  try {
    return JSON.parse(stdout)
  } catch {
    return undefined
  }
}

function getCountryFromArtist(artist) {
  if (!artist) return undefined

  const directCode = artist.country
  if (directCode && COUNTRY_NAMES[directCode]) {
    return {
      countryCode: directCode,
      country: COUNTRY_NAMES[directCode],
      flag: countryCodeToFlag(directCode),
    }
  }

  const areaName = artist.area?.name || artist["begin-area"]?.name
  const mappedCode = areaName ? AREA_COUNTRY_CODES[areaName] : undefined

  if (mappedCode) {
    return {
      countryCode: mappedCode,
      country: COUNTRY_NAMES[mappedCode],
      flag: countryCodeToFlag(mappedCode),
    }
  }

  return undefined
}

function getWikidataIdFromRelations(relations = []) {
  const wikidataUrl = relations.find(
    (relation) =>
      relation.type === "wikidata" &&
      relation.url?.resource?.includes("wikidata.org/wiki/")
  )?.url?.resource

  return wikidataUrl?.match(/Q\d+/)?.[0]
}

function getLabelsFromRelations(relations = []) {
  return uniqueCompact(
    relations
      .filter((relation) => relation["target-type"] === "label")
      .map((relation) => relation.label?.name || "")
  )
}

async function fetchWikidataLabels(entityId) {
  if (!entityId) return []

  const data = await curlJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`
  )
  const labelIds =
    data?.entities?.[entityId]?.claims?.P264?.map(
      (claim) => claim.mainsnak?.datavalue?.value?.id || ""
    ).filter(Boolean) || []

  if (labelIds.length === 0) return []

  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: labelIds.join("|"),
    props: "labels",
    languages: "en",
    format: "json",
    origin: "*",
  })
  const labelsData = await curlJson(
    `https://www.wikidata.org/w/api.php?${params.toString()}`
  )

  return uniqueCompact(
    Object.values(labelsData?.entities || {}).map(
      (entity) => entity.labels?.en?.value || ""
    )
  )
}

async function fetchMusicBrainzInfo(name) {
  const params = new URLSearchParams({
    query: `artist:"${cleanArtistQuery(name)}"`,
    fmt: "json",
    limit: "3",
  })
  const searchData = await curlJson(
    `https://musicbrainz.org/ws/2/artist/?${params.toString()}`
  )
  const artist = searchData?.artists?.find(
    (candidate) => (candidate.score || 0) >= 80
  )

  if (!artist?.id) {
    return undefined
  }

  await wait(1100)

  const detailParams = new URLSearchParams({
    inc: "label-rels+url-rels+tags",
    fmt: "json",
  })
  const details =
    (await curlJson(
      `https://musicbrainz.org/ws/2/artist/${artist.id}?${detailParams.toString()}`
    )) || artist
  const relations = details.relations || artist.relations || []
  const wikidataLabels = await fetchWikidataLabels(
    getWikidataIdFromRelations(relations)
  )
  const relationLabels = getLabelsFromRelations(relations)
  const tags =
    (details.tags || artist.tags)
      ?.slice()
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .map((tag) => tag.name)
      .filter(Boolean)
      .slice(0, 3) || []

  return {
    tags,
    labels: uniqueCompact([...relationLabels, ...wikidataLabels]),
    origin: getCountryFromArtist(details || artist),
  }
}

function findFestivalMentions(text) {
  return uniqueCompact(
    KNOWN_FESTIVALS.filter((festival) => {
      const pattern = new RegExp(
        `\\b${festival.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i"
      )
      return pattern.test(text)
    }),
    3
  )
}

async function fetchWikipediaExtract(title) {
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts",
    exlimit: "1",
    explaintext: "1",
    redirects: "1",
    titles: title,
    format: "json",
    origin: "*",
  })
  const extractData = await curlJson(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`
  )
  const page = Object.values(extractData?.query?.pages || {})[0]

  return page?.extract || ""
}

async function fetchWikipediaSummary(name) {
  const params = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: `${cleanArtistQuery(name)} musician DJ`,
    format: "json",
    origin: "*",
    srlimit: "1",
  })
  const searchData = await curlJson(
    `https://en.wikipedia.org/w/api.php?${params.toString()}`
  )
  const title = searchData?.query?.search?.[0]?.title

  if (!title) return undefined

  const summary = await curlJson(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  )
  const extract = summary?.extract?.trim()

  if (
    !extract ||
    /may refer to/i.test(extract) ||
    !isReliableWikipediaMatch(name, summary)
  ) {
    return undefined
  }

  const fullExtract = await fetchWikipediaExtract(title)

  return {
    extract,
    festivals: findFestivalMentions(fullExtract || extract),
    sourceUrl: summary.content_urls?.desktop?.page,
  }
}

function fallbackInfo(name) {
  return {
    bio: `${name} appears on the Waking Life 2026 lineup. A reliable public artist profile was not found for this exact name, so this panel is ready for a verified short bio about their sound and background.`,
    tags: [],
    labels: [],
    festivals: [],
    residentAdvisorUrl: getResidentAdvisorSearchUrl(name),
    sourceLabel: "Local fallback",
  }
}

async function buildArtistInfo(name) {
  const [musicBrainzInfo, wikipediaSummary] = await Promise.allSettled([
    fetchMusicBrainzInfo(name),
    fetchWikipediaSummary(name),
  ])

  const mb =
    musicBrainzInfo.status === "fulfilled" ? musicBrainzInfo.value : undefined
  const wiki =
    wikipediaSummary.status === "fulfilled" ? wikipediaSummary.value : undefined
  const tags = mb?.tags || []
  const labels = mb?.labels || []
  const festivals = wiki?.festivals || []
  const tagText = formatTags(tags)
  const styleIntro = tagText
    ? `${name} is associated with ${tagText}.`
    : ""
  const labelText =
    labels.length > 0
      ? `Releases and label associations include ${formatTags(labels)}.`
      : ""
  const festivalText =
    festivals.length > 0
      ? `Festival mentions include ${formatTags(festivals)}.`
      : ""
  const wikiText = wiki?.extract ? sentenceLimit(wiki.extract, 3) : ""
  const bio = sentenceLimit(
    [styleIntro, wikiText, labelText, festivalText]
      .filter(Boolean)
      .join(" ")
      .trim(),
    4
  )

  if (!bio) {
    return fallbackInfo(name)
  }

  return {
    bio,
    tags,
    labels,
    festivals,
    residentAdvisorUrl: getResidentAdvisorSearchUrl(name),
    sourceLabel: wiki?.sourceUrl
      ? "Imported from MusicBrainz, Wikidata and Wikipedia"
      : "Imported from MusicBrainz and Wikidata",
    sourceUrl: wiki?.sourceUrl || "https://musicbrainz.org/",
    ...mb?.origin,
  }
}

function getArtistNames(source) {
  return Array.from(
    new Set([...source.matchAll(/"name":"([^"]+)"/g)].map((match) => match[1]))
  )
}

function toTs(records) {
  return `import type { ArtistInfo } from "@/lib/artist-info"

// Generated by scripts/generate-artist-info-db.mjs.
// Do not edit manually; rerun the script to refresh imported artist metadata.
export const artistInfoDatabase: Record<string, ArtistInfo> = ${JSON.stringify(records, null, 2)}
`
}

const timetableSource = await readFile(TIMETABLE_PATH, "utf8")
const artistNames = getArtistNames(timetableSource)
const records = {}
let importedCount = 0

console.log(`Importing metadata for ${artistNames.length} artists...`)

for (const [index, name] of artistNames.entries()) {
  process.stdout.write(`[${index + 1}/${artistNames.length}] ${name} `)

  try {
    records[name] = await buildArtistInfo(name)
    if (records[name].sourceLabel !== "Local fallback") {
      importedCount += 1
    }
    process.stdout.write("ok\n")
  } catch (error) {
    records[name] = fallbackInfo(name)
    process.stdout.write(`fallback (${error.message})\n`)
  }

  await wait(1100)
}

if (importedCount === 0) {
  throw new Error(
    "No artist metadata was imported. Check network access before overwriting data/artist-info-db.ts."
  )
}

await writeFile(OUTPUT_PATH, toTs(records), "utf8")
console.log(`Wrote ${OUTPUT_PATH.pathname} with ${importedCount} imported records`)
