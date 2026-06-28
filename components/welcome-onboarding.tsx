"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import {
  getPlatform,
  hasSeenWelcome,
  isInstalledPwa,
  isIOSSafari,
  markWelcomeSeen,
  type Platform,
} from "@/lib/pwa-utils"
import { trackWelcomeOnboarding } from "@/lib/analytics"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

function InstallSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2 text-sm font-bold lowercase leading-relaxed text-black/75 dark:text-white/75">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center border border-black text-xs font-black dark:border-white">
            {index + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}

function getManualSteps(platform: Platform): string[] {
  if (platform === "ios") {
    if (isIOSSafari()) {
      return [
        'tap the share button (square with arrow pointing up)',
        'scroll down and tap "add to home screen"',
        'tap "add"',
      ]
    }

    return [
      "open this page in safari",
      'tap the share button (square with arrow pointing up)',
      'scroll down and tap "add to home screen"',
      'tap "add"',
    ]
  }

  if (platform === "android") {
    return [
      "open this page in chrome",
      'tap the menu (three dots, top right)',
      'tap "add to home screen" or "install app"',
      'confirm with "add" or "install"',
    ]
  }

  return [
    "open this page on your phone",
    "follow the install steps for iphone or android",
    "access the timetable from your home screen",
  ]
}

export function WelcomeOnboarding() {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>("desktop")
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const finish = useCallback((action: "completed" | "installed") => {
    markWelcomeSeen()
    trackWelcomeOnboarding({ action, platform })
    setOpen(false)
  }, [platform])

  useEffect(() => {
    if (typeof window === "undefined") return

    const detectedPlatform = getPlatform()
    setPlatform(detectedPlatform)

    if (isInstalledPwa() || hasSeenWelcome()) return

    setOpen(true)
    trackWelcomeOnboarding({ action: "shown", platform: detectedPlatform })
  }, [])

  useEffect(() => {
    if (!open) return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    trackWelcomeOnboarding({
      action: outcome === "accepted" ? "installed" : "install_dismissed",
      platform,
    })

    if (outcome === "accepted") {
      finish("installed")
    }
  }

  if (!open) return null

  const showInstallSection = platform !== "desktop"
  const showAndroidDirectInstall = platform === "android" && deferredPrompt !== null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-onboarding-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-md flex-col border-2 border-black bg-white/95 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f5f0e8]">
        <div className="border-b border-black/25 px-5 pb-4 pt-5 dark:border-white/25">
          <p className="text-xs font-black uppercase tracking-wide text-black/50 dark:text-white/50">
            unofficial companion
          </p>
          <h2
            id="welcome-onboarding-title"
            className="mt-2 text-3xl font-black lowercase leading-none"
          >
            welcome to dekmantel {FESTIVAL_CONFIG.year}
          </h2>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <p className="text-base font-bold leading-7">
            your pocket timetable for the festival — star artists to save your favorites, check set
            times, and keep planning even when signal drops in the Amsterdamse Bos.
          </p>
          <p className="text-sm font-bold lowercase leading-relaxed text-black/65 dark:text-white/65">
            not affiliated with{" "}
            <a
              href={FESTIVAL_CONFIG.officialSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-2 underline-offset-4"
            >
              dekmantel organizers
            </a>
            .
          </p>

          {showInstallSection && (
            <div className="space-y-4 border-t border-black/25 pt-4 dark:border-white/25">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-black/50 dark:text-white/50">
                  add to home screen
                </p>
                <p className="mt-2 text-sm font-bold leading-relaxed">
                  install for quick access and full offline use.
                </p>
              </div>

              {showAndroidDirectInstall ? (
                <div className="space-y-3">
                  <p className="text-sm font-bold lowercase leading-relaxed text-black/65 dark:text-white/65">
                    tap below to install the app directly on your home screen.
                  </p>
                  <Button
                    onClick={handleAndroidInstall}
                    className="h-auto w-full rounded-none border-2 border-black bg-black py-3 text-sm font-black lowercase text-white hover:bg-black/90 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    install app
                  </Button>
                </div>
              ) : (
                <div className="border border-black/30 p-4 dark:border-white/30">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
                    <Smartphone className="h-3.5 w-3.5" />
                    {platform === "ios" && !isIOSSafari() ? "open in safari first" : platform}
                  </div>
                  {platform === "ios" && !isIOSSafari() && (
                    <p className="mb-3 text-sm font-bold lowercase leading-relaxed text-black/65 dark:text-white/65">
                      add to home screen only works in safari. copy this link and open it there.
                    </p>
                  )}
                  <InstallSteps steps={getManualSteps(platform)} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-black/25 px-5 py-4 dark:border-white/25">
          <Button
            onClick={() => finish("completed")}
            className="h-auto w-full rounded-none border-2 border-black bg-black py-3 text-sm font-black lowercase text-white hover:bg-black/90 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            start exploring
          </Button>
        </div>
      </div>
    </div>
  )
}
