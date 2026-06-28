import { execFile } from "node:child_process"
import { writeFile } from "node:fs/promises"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const ROOT = new URL("..", import.meta.url)
const DEFAULT_EXCEL =
  "/Users/frank@sodastudio.nl/Downloads/Dekmantel Schedule with short bios and soundcloud.xlsx"
const OUTPUT_PATH = new URL("public/festival-data.json", ROOT)
const DATA_VERSION = "2026.1.0"

const SHEET_TO_DAY = {
  "Friday 31.07": "friday",
  "Saturday 01.08": "saturday",
  "Sunday 02.08": "sunday",
}

const STAGES = [
  "The Loop",
  "UFO I",
  "UFO II",
  "The Nest",
  "Selectors",
  "Greenhouse",
  "Radar",
]

const LAST_SET_DURATION_MINUTES = 90
const MAX_END_TIME = "23:00"

function slugify(name, stage, startDay, startTime) {
  return `${name}-${stage}-${startDay}-${startTime}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function fromMinutes(minutes) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

function addMinutes(time, delta) {
  return fromMinutes(toMinutes(time) + delta)
}

function minTime(a, b) {
  return toMinutes(a) <= toMinutes(b) ? a : b
}

async function loadSheetJson(excelPath, sheetName) {
  const { stdout } = await execFileAsync(
    "npx",
    ["--yes", "xlsx-cli", excelPath, "--sheet", sheetName, "--json"],
    { maxBuffer: 1024 * 1024 * 8 },
  )
  return JSON.parse(stdout)
}

function parseSheetRows(rows, dayId) {
  if (!rows.length) return []

  const header = rows[0]
  const timeKey = Object.keys(header).find((key) => !key.startsWith("__EMPTY")) || Object.keys(header)[0]
  const emptyKeys = Object.keys(header)
    .filter((key) => key.startsWith("__EMPTY"))
    .sort((a, b) => {
      const ai = Number(a.replace("__EMPTY", "") || 0)
      const bi = Number(b.replace("__EMPTY", "") || 0)
      return ai - bi
    })

  const stageKeys = emptyKeys.slice(0, STAGES.length)
  const slotsByStage = new Map(STAGES.map((stage) => [stage, []]))

  for (const row of rows.slice(1)) {
    const startTime = String(row[timeKey] || "").trim()
    if (!startTime || !/^\d{1,2}:\d{2}$/.test(startTime)) continue

    for (let i = 0; i < stageKeys.length; i += 1) {
      const name = String(row[stageKeys[i]] || "").trim()
      if (!name) continue
      slotsByStage.get(STAGES[i]).push({ name, startTime })
    }
  }

  const entries = []

  for (const stage of STAGES) {
    const slots = slotsByStage.get(stage)
    for (let i = 0; i < slots.length; i += 1) {
      const { name, startTime } = slots[i]
      const nextStart = slots[i + 1]?.startTime
      const endTime = nextStart
        ? nextStart
        : minTime(addMinutes(startTime, LAST_SET_DURATION_MINUTES), MAX_END_TIME)

      entries.push({
        id: slugify(name, stage, dayId, startTime),
        name,
        startTime,
        endTime,
        stage,
        startDay: dayId,
        endDay: dayId,
        category: "Music",
      })
    }
  }

  return entries
}

const excelPath = process.argv[2] || DEFAULT_EXCEL
const timetable = []

for (const [sheetName, dayId] of Object.entries(SHEET_TO_DAY)) {
  const rows = await loadSheetJson(excelPath, sheetName)
  timetable.push(...parseSheetRows(rows, dayId))
}

timetable.sort((a, b) => {
  const dayOrder = ["friday", "saturday", "sunday"]
  const dayDiff = dayOrder.indexOf(a.startDay) - dayOrder.indexOf(b.startDay)
  if (dayDiff !== 0) return dayDiff
  const stageDiff = STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
  if (stageDiff !== 0) return stageDiff
  return toMinutes(a.startTime) - toMinutes(b.startTime)
})

const payload = {
  version: DATA_VERSION,
  timetable,
}

await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

console.log(`Wrote ${OUTPUT_PATH.pathname}`)
console.log(`Timetable entries: ${timetable.length}`)
