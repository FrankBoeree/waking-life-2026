"use client"

import { useState, useEffect } from "react"
import { Mic, Calendar, RefreshCw, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import TimetableView from "@/components/timetable-view"
import LineupView from "@/components/lineup-view"
import { InstallPrompt } from "@/components/install-prompt"
import { WelcomeOnboarding } from "@/components/welcome-onboarding"
import { AppInfoPanel } from "@/components/app-info-panel"
import { AppSharePanel } from "@/components/app-share-panel"
import { PostFestivalSheet } from "@/components/post-festival-sheet"
import { useOfflineData } from "@/hooks/use-offline-data"
import { trackViewSwitch, trackDataRefresh } from "@/lib/analytics"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import { isBeforeFestivalStart } from "@/lib/festival-dates"

export default function Home() {
  const [activeView, setActiveView] = useState<"timetable" | "lineup">("timetable")
  const [manualThemeOverride, setManualThemeOverride] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { data, refreshData, isLoading, error } = useOfflineData()
  const [countdown, setCountdown] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    show: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, show: true })
  const [mounted, setMounted] = useState(false)

  const handleViewChange = (view: "timetable" | "lineup") => {
    setActiveView(view)
    trackViewSwitch(view)
  }

  const handleRefresh = async () => {
    trackDataRefresh()
    await refreshData()
  }

  const shouldUseDarkMode = () => {
    const hour = new Date().getHours()
    return hour >= 21 || hour < 7
  }

  const handleThemeToggle = () => {
    setManualThemeOverride(true)
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Countdown until the official festival start — hidden once the festival begins.
  useEffect(() => {
    const targetDate = new Date(FESTIVAL_CONFIG.officialStartDateTime)

    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (!isBeforeFestivalStart(now)) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, show: false })
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      
      setCountdown({ days, hours, minutes, seconds, show: true })
    }
    
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || manualThemeOverride) return

    const updateThemeForTime = () => {
      setTheme(shouldUseDarkMode() ? "dark" : "light")
    }

    updateThemeForTime()
    const interval = setInterval(updateThemeForTime, 60 * 1000)

    return () => clearInterval(interval)
  }, [manualThemeOverride, mounted, setTheme])

  return (
    <div className="h-dvh flex flex-col overflow-hidden dekmantel-shell text-[#222] dark:text-[#f5f0e8]">
      {/* Page Header - not clickable */}
      <header className="sticky top-0 z-50 shrink-0 border-b-2 border-black bg-transparent pt-[env(safe-area-inset-top)] dark:border-white">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="line-clamp-2 text-base font-bold leading-tight text-[#222] sm:text-xl md:text-2xl dark:text-[#f7f3e7]">
                {FESTIVAL_CONFIG.title}
              </h1>
              <p className="sr-only">
                Festival timetable and lineup for Dekmantel Festival 2026, taking place {FESTIVAL_CONFIG.officialDateRange}.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-transparent text-[#222] hover:bg-black hover:text-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                aria-label="Refresh app and timetable"
                title="Refresh app and timetable"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              <AppSharePanel />
              <AppInfoPanel />

              {mounted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleThemeToggle}
                  className="border-black bg-transparent text-[#222] hover:bg-black hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                  aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  title={resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {mounted && countdown.show && (
            <p
              className="mt-1 w-full text-xs font-medium lowercase text-black/45 dark:text-white/45"
              aria-live="polite"
            >
              starts in{" "}
              <span className="tabular-nums">
                {countdown.days > 0 && `${countdown.days}d `}
                {countdown.hours.toString().padStart(2, "0")}h{" "}
                {countdown.minutes.toString().padStart(2, "0")}m{" "}
                {countdown.seconds.toString().padStart(2, "0")}s
              </span>
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={activeView === "timetable" ? "flex-1 min-h-0 overflow-hidden" : "flex-1 min-h-0 overflow-y-auto"}>
        {activeView === "timetable" ? (
          <TimetableView data={data} isLoading={isLoading} error={error} />
        ) : (
          <LineupView data={data} />
        )}
      </main>

      {/* Bottom Navigation - always visible */}
      <nav className="shrink-0 border-t-2 border-black bg-transparent pb-[env(safe-area-inset-bottom)] z-50 dark:border-white">
        <div className="flex justify-center items-center py-4 px-4">
          <div className="flex gap-2">
            <Button
              variant={activeView === "timetable" ? "default" : "secondary"}
              size="lg"
              className={`rounded-none border border-black px-4 py-3 font-bold lowercase ${
                activeView === "timetable" 
                  ? "bg-black hover:bg-black text-white dark:bg-white dark:text-black" 
                  : "bg-transparent hover:bg-black text-[#222] hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
              }`}
              onClick={() => handleViewChange("timetable")}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Timetable
            </Button>
            <Button
              variant={activeView === "lineup" ? "default" : "secondary"}
              size="lg"
              className={`rounded-none border border-black px-4 py-3 font-bold lowercase ${
                activeView === "lineup" 
                  ? "bg-black hover:bg-black text-white dark:bg-white dark:text-black" 
                  : "bg-transparent hover:bg-black text-[#222] hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
              }`}
              onClick={() => handleViewChange("lineup")}
            >
              <Mic className="w-4 h-4 mr-1" />
              Lineup
            </Button>
          </div>
        </div>
      </nav>
      
      <WelcomeOnboarding />

      {/* Install Prompt — shown on return visits when the native prompt is available */}
      <InstallPrompt />

      <PostFestivalSheet timetable={data?.timetable} />
    </div>
  )
}
