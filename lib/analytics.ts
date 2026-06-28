export const GA_MEASUREMENT_ID = "G-3YX2X16XJV"

type AnalyticsParams = Record<string, string | number | boolean>

export type ArtistViewSource = "lineup" | "timetable"
export type FavoriteSource = "lineup_list" | "timetable" | "detail_sheet"
export type ExternalLinkType = "resident_advisor" | "source"

function trackEvent(eventName: string, params?: AnalyticsParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return

  const cleaned = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ""),
  )

  window.gtag("event", eventName, cleaned)
}

export function trackViewArtist(params: {
  artistId: string
  artistName: string
  artistCategory?: string
  source: ArtistViewSource
}) {
  trackEvent("view_artist", {
    artist_id: params.artistId,
    artist_name: params.artistName,
    artist_category: params.artistCategory ?? "",
    source: params.source,
  })
}

export function trackFavoriteChange(params: {
  artistId: string
  artistName?: string
  artistCategory?: string
  source: FavoriteSource
  action: "add" | "remove"
}) {
  trackEvent(params.action === "add" ? "add_to_favorites" : "remove_from_favorites", {
    artist_id: params.artistId,
    artist_name: params.artistName ?? "",
    artist_category: params.artistCategory ?? "",
    source: params.source,
  })
}

export function trackArtistSearch(params: { searchTerm: string; resultsCount: number }) {
  trackEvent("search_artists", {
    search_term: params.searchTerm,
    results_count: params.resultsCount,
  })
}

export function trackCategoryFilter(category: string | null) {
  trackEvent("filter_category", {
    category: category ?? "all",
  })
}

export function trackDayFilter(day: string | null) {
  trackEvent("filter_day", {
    day: day ?? "all",
  })
}

export function trackFavoritesFilter(enabled: boolean) {
  trackEvent("filter_favorites", { enabled })
}

export function trackViewSwitch(view: "timetable" | "lineup") {
  trackEvent("select_view", { view })
}

export function trackShareApp() {
  trackEvent("share_app")
}

export function trackInstallPrompt(outcome: "accepted" | "dismissed") {
  trackEvent("install_prompt", { outcome })
}

export function trackWelcomeOnboarding(params: {
  action:
    | "shown"
    | "completed"
    | "installed"
    | "share_opened"
    | "share_failed"
    | "install_dismissed"
  platform: string
}) {
  trackEvent("welcome_onboarding", {
    action: params.action,
    platform: params.platform,
  })
}

export function trackDataRefresh() {
  trackEvent("refresh_data")
}

export function trackExternalLink(params: {
  artistId: string
  artistName: string
  linkType: ExternalLinkType
  url: string
}) {
  trackEvent("click_external_link", {
    artist_id: params.artistId,
    artist_name: params.artistName,
    link_type: params.linkType,
    link_url: params.url,
  })
}
