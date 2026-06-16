"use client"

import { useCallback, useEffect, useState } from "react"
import { clearOfflineAppData, initializeOfflineCapabilities, refreshAppShell } from "@/lib/offline-storage"
import { checkForAppUpdate, markCurrentAppVersionInstalled } from "@/lib/app-version"
import { useFavorites } from "@/contexts/favorites-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff } from "lucide-react"

function trackWaitingWorker(
  registration: ServiceWorkerRegistration,
  onWaiting: (worker: ServiceWorker) => void,
) {
  if (registration.waiting) {
    onWaiting(registration.waiting)
  }

  registration.addEventListener("updatefound", () => {
    const installingWorker = registration.installing
    if (!installingWorker) return

    installingWorker.addEventListener("statechange", () => {
      if (
        installingWorker.state === "installed" &&
        navigator.serviceWorker.controller &&
        registration.waiting
      ) {
        onWaiting(registration.waiting)
      }
    })
  })
}

export function OfflineInitializer() {
  const [showStatus, setShowStatus] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [remoteUpdateAvailable, setRemoteUpdateAvailable] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const { isOnline } = useFavorites()

  const checkForUpdates = useCallback(async (registration?: ServiceWorkerRegistration | null) => {
    if (!navigator.onLine) return

    if (registration) {
      try {
        await registration.update()
      } catch (error) {
        console.warn("Service worker update check failed:", error)
      }

      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
      }
    }

    const updateAvailable = await checkForAppUpdate()
    setRemoteUpdateAvailable(updateAvailable)

    if (!updateAvailable && !registration?.waiting) {
      markCurrentAppVersionInstalled()
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        const registration = await initializeOfflineCapabilities()

        if (registration) {
          trackWaitingWorker(registration, setWaitingWorker)
        }

        await checkForUpdates(registration)

        setShowStatus(true)
        setTimeout(() => setShowStatus(false), 3000)
      } catch (error) {
        console.error("Failed to initialize offline capabilities:", error)
      }
    }

    init()
  }, [checkForUpdates])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return

      navigator.serviceWorker.getRegistration().then((registration) => {
        checkForUpdates(registration)
      })
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [checkForUpdates])

  useEffect(() => {
    if (!waitingWorker) return

    let reloadStarted = false
    const handleControllerChange = () => {
      if (reloadStarted) return
      reloadStarted = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
    }
  }, [waitingWorker])

  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true)
    } else {
      const timer = setTimeout(() => setShowStatus(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  const handleHardReset = async () => {
    setIsResetting(true)
    await clearOfflineAppData()

    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      return
    }

    await refreshAppShell()
  }

  const showUpdateBanner = Boolean(waitingWorker || remoteUpdateAvailable)

  if (showUpdateBanner) {
    return (
      <div className="fixed left-4 right-4 top-4 z-[60] border-2 border-black bg-white p-4 text-[#222] shadow-lg mix-blend-normal dark:border-white dark:bg-black dark:text-[#f7f3e7]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black lowercase">update available</p>
            <p className="text-sm font-bold lowercase text-black/65 dark:text-white/65">
              A newer version of the app is ready. Reset the local cache to load the latest timetable and lineup.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleHardReset}
            disabled={isResetting}
            className="rounded-none border-2 border-black bg-black font-black lowercase text-white hover:bg-black/85 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/85"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? "animate-spin" : ""}`} />
            reset and update
          </Button>
        </div>
      </div>
    )
  }

  if (!showStatus) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 shadow-lg"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Offline</span>
          </>
        )}
      </Badge>
    </div>
  )
}
