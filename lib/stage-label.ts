/** Display label for stage names in the lowercase UI. */
export function formatStageLabel(stage: string): string {
  const normalized = stage.trim().toLowerCase()
  if (normalized === "ufo ii") return "UFO II"
  if (normalized === "ufo i") return "UFO I"
  return stage.trim().toLowerCase()
}
