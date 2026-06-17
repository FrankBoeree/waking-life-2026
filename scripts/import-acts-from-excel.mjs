import { execSync } from "node:child_process"
import { writeFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFAULT_EXCEL_PATH =
  "/Users/frank@sodastudio.nl/Downloads/Compentencies/Waking_Life_With_Descriptions222.xlsx"

const STAGE_SHEETS = [
  { index: 0, stage: "Apuro" },
  { index: 1, stage: "Moonscreen" },
  { index: 2, stage: "Suna" },
  { index: 3, stage: "Tudo Bem" },
]

const DAYS = ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "monday"]

function slugify(name, stage, startDay, startTime) {
  return `${name}-${stage}-${startDay}-${startTime}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function toDayId(dayName) {
  return dayName.trim().toLowerCase()
}

function nextDay(day) {
  const idx = DAYS.indexOf(day)
  return idx >= 0 && idx < DAYS.length - 1 ? DAYS[idx + 1] : day
}

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function actEntry({ title, stage, startDay, startTime, endTime, category, hosts, description }) {
  const startMinutes = toMinutes(startTime)
  const endMinutes = toMinutes(endTime)
  const endDay = endMinutes <= startMinutes ? nextDay(startDay) : startDay

  return {
    id: slugify(title, stage, startDay, startTime),
    name: title,
    startTime,
    endTime,
    stage,
    startDay,
    endDay,
    category: category?.trim() || "Performance",
    ...(hosts?.trim() ? { hosts: hosts.trim() } : {}),
    ...(description?.trim() ? { description: description.trim() } : {}),
  }
}

function loadSheetJson(excelPath, sheetIndex) {
  const output = execSync(
    `npx --yes xlsx-cli -j "${excelPath}" --sheet-index ${sheetIndex}`,
    { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
  )
  return JSON.parse(output.trim())
}

export function loadActsFromExcel(excelPath = process.env.ACTS_EXCEL_PATH || DEFAULT_EXCEL_PATH) {
  if (!existsSync(excelPath)) {
    throw new Error(`Acts Excel file not found: ${excelPath}`)
  }

  const acts = []

  for (const { index, stage } of STAGE_SHEETS) {
    const rows = loadSheetJson(excelPath, index)

    for (const row of rows) {
      const startDay = toDayId(row.Day)
      if (!DAYS.includes(startDay)) {
        throw new Error(`Unknown day "${row.Day}" for act "${row.Title}" on ${stage}`)
      }

      acts.push(
        actEntry({
          title: row.Title,
          stage,
          startDay,
          startTime: row.Start,
          endTime: row.End,
          category: row.Category,
          hosts: row.Hosts,
          description: row.Description,
        }),
      )
    }
  }

  const ids = new Set()
  for (const act of acts) {
    if (ids.has(act.id)) {
      throw new Error(`Duplicate act id: ${act.id}`)
    }
    ids.add(act.id)
  }

  return acts
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const excelPath = process.env.ACTS_EXCEL_PATH || DEFAULT_EXCEL_PATH
  const acts = loadActsFromExcel(excelPath)
  const outputPath = join(__dirname, "../data/acts.json")
  writeFileSync(outputPath, `${JSON.stringify(acts, null, 2)}\n`)
  console.log(`Wrote ${acts.length} acts to ${outputPath}`)
}
