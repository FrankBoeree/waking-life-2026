"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { stages, days, type Artist } from "@/data/timetable"
import { useFavorites } from "@/contexts/favorites-context"
import type { OfflineData } from "@/lib/offline-storage"
import { FESTIVAL_CONFIG, PROGRAM_DAY_ORDER, type ProgramDayId } from "@/lib/festival-config"

const HOUR_WIDTH = 240
const MINUTES_PER_DAY = 24 * 60
const PIXELS_PER_MINUTE = HOUR_WIDTH / 60

function FavoriteStarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 ${filled ? "text-yellow-400" : ""}`}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        vectorEffect="non-scaling-stroke"
        d="M12 3.25l2.66 5.39 5.95.86-4.3 4.19 1.01 5.92L12 16.81l-5.32 2.8 1.01-5.92-4.3-4.19 5.95-.86L12 3.25z"
      />
    </svg>
  )
}

function timeToMinutes(time: string) {
  if (!time || time === "--") return 0
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

function getDayIndex(dayId?: string) {
  return PROGRAM_DAY_ORDER.indexOf(dayId as ProgramDayId)
}

function getDayDate(dayId: ProgramDayId) {
  return days.find((day) => day.id === dayId)?.date
}

function getTimelineStartDate() {
  const startDate = getDayDate(FESTIVAL_CONFIG.programStartDay)
  if (!startDate) return null

  return new Date(`${startDate}T${FESTIVAL_CONFIG.programStartTime}:00`)
}

function getDayStartMinutes(dayId: ProgramDayId) {
  const startDate = getTimelineStartDate()
  const dayDate = getDayDate(dayId)
  if (!startDate || !dayDate) return 0

  const dayStart = new Date(`${dayDate}T00:00:00`)
  const minutes = (dayStart.getTime() - startDate.getTime()) / 60000
  return Math.max(0, minutes)
}

function getMinutesSinceFestivalStart(artist: Artist) {
  const startDayIdx = getDayIndex(FESTIVAL_CONFIG.programStartDay)
  const artistStartDayIdx = getDayIndex(artist.startDay)
  if (artistStartDayIdx === -1) return 0

  const daysDiff = artistStartDayIdx - startDayIdx
  const festivalStartMin = timeToMinutes(FESTIVAL_CONFIG.programStartTime)
  const artistStartMin = timeToMinutes(artist.startTime)
  return daysDiff * MINUTES_PER_DAY + (artistStartMin - festivalStartMin)
}

function getArtistDuration(artist: Artist) {
  const startDayIdx = getDayIndex(artist.startDay)
  const endDayIdx = getDayIndex(artist.endDay)
  const daysDiff = Math.max(0, endDayIdx - startDayIdx)
  const startMin = timeToMinutes(artist.startTime)
  const endMin = timeToMinutes(artist.endTime)
  return daysDiff * MINUTES_PER_DAY + (endMin - startMin)
}

function getFestivalTotalMinutes(timetable: Artist[]) {
  let max = 0
  for (const artist of timetable) {
    const start = getMinutesSinceFestivalStart(artist)
    const duration = getArtistDuration(artist)
    if (start + duration > max) max = start + duration
  }

  return Math.ceil(max / 60) * 60
}

function getCurrentTimePosition(totalMinutes: number) {
  const now = new Date()
  const start = getTimelineStartDate()
  if (!start) return null

  const minutes = Math.floor((now.getTime() - start.getTime()) / 60000)
  if (minutes < 0 || minutes > totalMinutes) return null

  return minutes
}

interface TimetableViewProps {
  data: OfflineData | null
  isLoading: boolean
  error: string | null
}

export default function TimetableView({ data, isLoading, error }: TimetableViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)
  const [activeDay, setActiveDay] = useState<ProgramDayId>(FESTIVAL_CONFIG.programStartDay)

  const timetable = data?.timetable || []
  const totalMinutes = getFestivalTotalMinutes(timetable)
  const totalHours = totalMinutes / 60
  const timelineWidth = totalHours * HOUR_WIDTH
  const hourLabels = Array.from({ length: totalHours + 1 }, (_, hour) => hour)
  const dayStartMinutes = PROGRAM_DAY_ORDER.reduce<Record<ProgramDayId, number>>((acc, day) => {
    acc[day] = getDayStartMinutes(day)
    return acc
  }, {} as Record<ProgramDayId, number>)

  // Update current time position every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimePosition(getCurrentTimePosition(totalMinutes))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    
    return () => clearInterval(interval)
  }, [totalMinutes])

  // Auto-scroll to current time when component mounts or current time changes
  useEffect(() => {
    if (currentTimePosition !== null && scrollRef.current) {
      // Add a longer delay to ensure DOM is fully rendered and timeline width is calculated
      const timeoutId = setTimeout(() => {
        if (scrollRef.current) {
          const scrollPosition = currentTimePosition * PIXELS_PER_MINUTE
          const viewportWidth = scrollRef.current.clientWidth
          const targetScrollLeft = scrollPosition - (viewportWidth / 2)
          
          scrollRef.current.scrollTo({ 
            left: Math.max(0, targetScrollLeft), 
            behavior: "smooth" 
          });
        }
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentTimePosition])

  // Additional effect to handle initial scroll after data loads
  useEffect(() => {
    if (!isLoading && currentTimePosition !== null && scrollRef.current) {
      const timeoutId = setTimeout(() => {
        if (scrollRef.current) {
          const scrollPosition = currentTimePosition * PIXELS_PER_MINUTE
          const viewportWidth = scrollRef.current.clientWidth
          const targetScrollLeft = scrollPosition - (viewportWidth / 2)
          
          scrollRef.current.scrollTo({ 
            left: Math.max(0, targetScrollLeft), 
            behavior: "smooth" 
          });
        }
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isLoading, currentTimePosition])

  // Scroll to day tab
  function scrollToDay(day: ProgramDayId) {
    if (!scrollRef.current) return
    
    const targetMinutes = dayStartMinutes[day] || 0
    const px = targetMinutes * PIXELS_PER_MINUTE
    scrollRef.current.scrollTo({ left: px, behavior: "smooth" })
  }

  // Detect active day when scrolling - switch as soon as day start is visible
  function handleScroll() {
    if (!scrollRef.current) return
    const scrollLeft = scrollRef.current.scrollLeft
    
    // Calculate scroll position in minutes since festival start
    const scrollMinutes = scrollLeft / PIXELS_PER_MINUTE
    
    // Determine which day is active based on scroll position
    let foundDay: ProgramDayId = PROGRAM_DAY_ORDER[0]
    
    // Loop through all days to find which day is active
    for (const day of PROGRAM_DAY_ORDER) {
      const dayStartMin = dayStartMinutes[day]
      
      // If we're past the start point of this day, update the active day
      if (scrollMinutes >= dayStartMin) {
        foundDay = day
      }
    }
    
    if (foundDay !== activeDay) {
      setActiveDay(foundDay)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-12 text-black/60 dark:text-white/60">
        <p>Loading timetable...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center py-12 text-red-700 dark:text-red-300">
        <p>Error loading timetable: {error}</p>
      </div>
    )
  }

  // Show fallback if no data
  if (!timetable || timetable.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-12 text-[#222] dark:text-[#f7f3e7]">
        <div className="max-w-xl border-2 border-black bg-white/75 p-6 text-center mix-blend-multiply dark:border-white dark:bg-black/65 dark:mix-blend-normal">
          <p className="mb-3 text-2xl font-black lowercase">timetable not available yet</p>
          <p className="text-base font-bold lowercase leading-7 text-black/65 dark:text-white/65">
            Exact times and stages for Waking Life 2026 have not been published yet. When an update is ready, the app will show a banner so you can hard reset the offline cache.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-transparent text-[#222] dark:text-[#f7f3e7]">
      {/* Day tabs - horizontally scrollable (sticky) */}
      <div className="sticky top-0 z-40 border-b-2 border-black bg-white/70 backdrop-blur-sm mix-blend-multiply dark:border-white dark:bg-black/70 dark:mix-blend-normal">
        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 px-4 py-3" style={{ minWidth: 'max-content' }}>
            {PROGRAM_DAY_ORDER.map((day) => (
              <Button
                key={day}
                variant={activeDay === day ? "default" : "outline"}
                className={`rounded-none border border-black px-4 py-2 font-bold lowercase transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeDay === day 
                    ? "bg-black text-white dark:bg-white dark:text-black" 
                    : "bg-transparent text-[#222] hover:bg-black hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                }`}
                onClick={() => scrollToDay(day)}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Scrollable timeline (inclusief tijdlabels) */}
          <div className="flex-1 overflow-auto timetable-scrollbar" ref={scrollRef} onScroll={handleScroll}>
            {/* Time labels - nu onderdeel van de scrollbare timeline */}
            <div className="flex relative px-4" style={{ width: timelineWidth }}>
              {hourLabels.map((h) => (
                <div
                  key={h}
                  className="text-left text-black/55 text-sm font-bold flex-shrink-0 py-2 lowercase dark:text-white/60"
                  style={{ width: `${HOUR_WIDTH}px` }}
                >
                  {formatTime(timeToMinutes(FESTIVAL_CONFIG.programStartTime) + h * 60)}
                </div>
              ))}
              {/* Now indicator - red vertical line */}
              {currentTimePosition !== null && (
                <div
                  className="absolute top-0 z-50 pointer-events-none"
                  style={{
                    left: `${currentTimePosition * PIXELS_PER_MINUTE}px`,
                    height: '100%',
                  }}
                >
                  {/* Red line */}
                  <div className="w-0.5 bg-black h-full dark:bg-white"></div>
                  {/* "Now" label - centered on the line */}
                  <div className="absolute top-2 transform -translate-x-1/2 border border-black bg-white text-black text-xs font-bold px-2 py-1 lowercase dark:border-white dark:bg-black dark:text-white">
                    NOW
                  </div>
                </div>
              )}
            </div>
            {/* Artists per stage */}
            <div className="flex flex-col relative" style={{ width: timelineWidth }}>
              {/* Now indicator for artists section */}
              {currentTimePosition !== null && (
                <div
                  className="absolute top-0 z-50 pointer-events-none"
                  style={{
                    left: `${currentTimePosition * PIXELS_PER_MINUTE}px`,
                    height: '100%',
                  }}
                >
                  {/* Red line */}
                  <div className="w-0.5 bg-black h-full dark:bg-white"></div>
                </div>
              )}
              {stages.map((stage) => (
                <div key={stage.id} className="relative" style={{ height: "80px", width: timelineWidth, marginBottom: "16px" }}>
                  {/* Sticky stagenaam above the artist row */}
                  <div
                    className="text-xs font-bold text-black px-2 py-1 z-30 border border-black sticky left-0 lowercase mix-blend-multiply dark:border-white dark:mix-blend-normal"
                    style={{ 
                      backgroundColor: stage.color,
                      width: '200px',
                      whiteSpace: 'nowrap',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      position: 'sticky',
                      left: 0,
                      zIndex: 30
                    }}
                  >
                    {stage.name}
                  </div>
                  {/* Artist timeline */}
                  <div className="relative" style={{ height: "56px", width: timelineWidth, marginTop: "8px" }}>
                    {timetable.filter((a) => a.stage === stage.id).map((artist) => {
                      const left = getMinutesSinceFestivalStart(artist) * PIXELS_PER_MINUTE;
                      const width = getArtistDuration(artist) * PIXELS_PER_MINUTE;
                      const isFav = isFavorite(artist.id);
                      return (
                        <div
                          key={artist.id}
                          className={`absolute top-0 h-full border transition-colors cursor-pointer group flex flex-col justify-between mix-blend-multiply dark:mix-blend-normal ${
                            isFav
                              ? 'bg-black border-black dark:bg-white dark:border-white' 
                              : 'bg-white/80 border-black hover:bg-black dark:bg-black/60 dark:border-white dark:hover:bg-white'
                          }`}
                          style={{
                            left: `${left}px`,
                            width: `${width}px`,
                            minWidth: "60px",
                          }}
                          onClick={() => toggleFavorite(artist.id)}
                        >
                          {/* Ster icon right above */}
                          <div className="absolute top-1 right-1 z-10">
                            <span
                              onClick={e => { e.stopPropagation(); toggleFavorite(artist.id); }}
                              className="inline-flex items-center justify-center"
                            >
                              <FavoriteStarIcon filled={isFav} />
                            </span>
                          </div>
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div 
                              className={`text-xs font-bold truncate lowercase ${
                                isFav
                                  ? 'text-white dark:text-black'
                                  : 'text-[#222] group-hover:text-white dark:text-[#f7f3e7] dark:group-hover:text-black'
                              }`}
                            >
                              {artist.name}
                            </div>
                            <div className={`text-xs font-bold lowercase ${
                              isFav
                                ? 'text-white/80 dark:text-black/75'
                                : 'text-black/55 group-hover:text-white/80 dark:text-white/60 dark:group-hover:text-black/75'
                            }`}>
                              {artist.startTime} - {artist.endTime}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* Add bottom padding for scroll space */}
              <div style={{ height: "80px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
