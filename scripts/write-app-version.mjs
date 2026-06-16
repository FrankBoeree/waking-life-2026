import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const configSource = readFileSync(join(root, "lib/festival-config.ts"), "utf8")
const match = configSource.match(/cacheVersion:\s*"([^"]+)"/)

if (!match) {
  throw new Error("Could not read cacheVersion from lib/festival-config.ts")
}

const payload = { cacheVersion: match[1] }

writeFileSync(
  join(root, "public/app-version.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
)

console.log(`Wrote public/app-version.json (${payload.cacheVersion})`)
