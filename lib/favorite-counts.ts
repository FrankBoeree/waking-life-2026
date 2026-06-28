import { getSupabaseClient } from "@/lib/supabase/client"

export type FavoriteCountsMap = Record<string, number>

export async function fetchFavoriteCounts(): Promise<FavoriteCountsMap> {
  const supabase = getSupabaseClient()
  if (!supabase) return {}

  const { data, error } = await supabase
    .from("artist_favorite_counts")
    .select("artist_id, favorite_count")

  if (error) {
    console.error("Failed to fetch favorite counts:", error.message)
    return {}
  }

  return Object.fromEntries(
    (data ?? []).map((row) => [row.artist_id, row.favorite_count]),
  )
}

export async function adjustFavoriteCount(
  artistId: string,
  artistName: string | undefined,
  delta: -1 | 1,
): Promise<number | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc("adjust_artist_favorite_count", {
    p_artist_id: artistId,
    p_artist_name: artistName ?? null,
    p_delta: delta,
  })

  if (error) {
    console.error("Failed to adjust favorite count:", error.message)
    return null
  }

  return typeof data === "number" ? data : null
}

export function formatFavoriteLabel(base: string, count: number): string {
  return count > 0 ? `${base} (${count})` : base
}
