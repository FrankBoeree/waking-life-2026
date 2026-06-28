const MIN_CONTRAST_RATIO = 4.5

function parseHexColor(hex: string): [number, number, number] | null {
  const normalized = hex.trim().replace(/^#/, "")
  if (normalized.length === 3) {
    const [r, g, b] = normalized.split("")
    return [
      Number.parseInt(r + r, 16),
      Number.parseInt(g + g, 16),
      Number.parseInt(b + b, 16),
    ]
  }
  if (normalized.length === 6) {
    return [
      Number.parseInt(normalized.slice(0, 2), 16),
      Number.parseInt(normalized.slice(2, 4), 16),
      Number.parseInt(normalized.slice(4, 6), 16),
    ]
  }
  return null
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`
}

function mixWithBlack(
  [r, g, b]: [number, number, number],
  amount: number,
): [number, number, number] {
  const mix = 1 - amount
  return [
    Math.round(r * mix),
    Math.round(g * mix),
    Math.round(b * mix),
  ]
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const s = channel / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

function meetsContrast(
  rgb: [number, number, number],
  textLuminance: number,
  minRatio = MIN_CONTRAST_RATIO,
): boolean {
  const bgLuminance = getRelativeLuminance(...rgb)
  return getContrastRatio(bgLuminance, textLuminance) >= minRatio
}

/** Darkens a stage color as little as needed so white text meets WCAG AA contrast. */
export function getAccessibleStageLabelBackground(backgroundColor: string): string {
  const rgb = parseHexColor(backgroundColor)
  if (!rgb) return backgroundColor

  const whiteLuminance = 1
  if (meetsContrast(rgb, whiteLuminance)) {
    return backgroundColor
  }

  let low = 0
  let high = 1
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2
    if (meetsContrast(mixWithBlack(rgb, mid), whiteLuminance)) {
      high = mid
    } else {
      low = mid
    }
  }

  return rgbToHex(mixWithBlack(rgb, high))
}
