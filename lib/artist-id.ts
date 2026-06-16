/**
 * Stable, name-based identifier used to track favorites consistently across the
 * timetable and lineup views. Both views must resolve the same artist to the
 * same id so a favorite toggled in one place is reflected in the other.
 */
export function toArtistFavoriteId(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
