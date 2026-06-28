import sharp from "sharp"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")
const source = path.join(root, "assets", "app-icon-source.png")

const BRAND_ORANGE = { r: 230, g: 81, b: 36 }

const squareOutputs = [
  { file: "public/favicon-16x16.png", size: 16 },
  { file: "public/favicon-32x32.png", size: 32 },
  { file: "public/apple-touch-icon.png", size: 180 },
  { file: "public/icon-192x192.png", size: 192 },
  { file: "public/icon-512x512.png", size: 512 },
  { file: "app/icon.png", size: 512 },
  { file: "app/apple-icon.png", size: 180 },
]

async function generateSquareIcons() {
  for (const { file, size } of squareOutputs) {
    const output = path.join(root, file)
    await sharp(source).resize(size, size).png().toFile(output)
    console.log(`Generated ${file}`)
  }
}

async function generateSocialImages() {
  const iconSize = 520
  const icon = await sharp(source).resize(iconSize, iconSize).png().toBuffer()

  const socialTargets = [
    "app/opengraph-image.png",
    "app/twitter-image.png",
    "public/og-image.png",
  ]

  for (const file of socialTargets) {
    const output = path.join(root, file)
    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 3,
        background: BRAND_ORANGE,
      },
    })
      .composite([{ input: icon, gravity: "center" }])
      .png()
      .toFile(output)
    console.log(`Generated ${file}`)
  }
}

await generateSquareIcons()
await generateSocialImages()
