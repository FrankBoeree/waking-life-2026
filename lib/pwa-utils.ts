const WELCOME_SEEN_KEY = "festival-welcome-seen"

export type Platform = "ios" | "android" | "desktop"

export function getPlatform(): Platform {
  if (typeof window === "undefined") return "desktop"

  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

  if (isIOS) return "ios"
  if (/Android/i.test(ua)) return "android"
  return "desktop"
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false

  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  )
}

export function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false

  const ua = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)

  return isIOS && isSafari
}

export function canUseWebShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function"
}

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(WELCOME_SEEN_KEY) === "true"
}

export function markWelcomeSeen(): void {
  if (typeof window === "undefined") return
  localStorage.setItem(WELCOME_SEEN_KEY, "true")
}
