"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { stages, days, MUSIC_STAGES, type Artist } from "@/data/timetable"
import { useFavorites } from "@/contexts/favorites-context"
import type { OfflineData } from "@/lib/offline-storage"
import { FESTIVAL_CONFIG, PROGRAM_DAY_ORDER, type ProgramDayId } from "@/lib/festival-config"
import { toArtistFavoriteId } from "@/lib/artist-id"
import { getArtistCategory } from "@/lib/categories"
import {
  ArtistDetailSheet,
  buildArtistWithSlots,
  type ArtistWithSlots,
} from "@/components/artist-detail-sheet"

const HOUR_WIDTH = 240
const MINUTES_PER_DAY = 24 * 60
const PIXELS_PER_MINUTE = HOUR_WIDTH / 60
const MIMO_PROGRAM_BLOCK_MINUTES = 4 * 60
const MIMO_PAUSE_MINUTES = 2 * 60
const SINGLE_LANE_HEIGHT = 56
const STACKED_LANE_HEIGHT = 40
const STACKED_LANE_GAP = 4

function HourGridLines({ hours }: { hours: number }) {
  return (
    <>
      {Array.from({ length: hours + 1 }, (_, hour) => (
        <div
          key={hour}
          aria-hidden="true"
          className="absolute top-0 bottom-0 w-px bg-black/[0.06] dark:bg-white/[0.08]"
          style={{ left: `${hour * HOUR_WIDTH}px` }}
        />
      ))}
    </>
  )
}

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

function isOpenEndTime(time: string) {
  return !time || time === "--" || time === "..:.."
}

function timeToMinutes(time: string) {
  if (isOpenEndTime(time)) return 0
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatArtistTimeRange(artist: Artist) {
  const endTime = isOpenEndTime(artist.endTime) ? "..:.." : artist.endTime
  return `${artist.startTime} - ${endTime}`
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
  if (artist.durationMinutes != null) {
    return artist.durationMinutes
  }

  const startDayIdx = getDayIndex(artist.startDay)
  const endDayIdx = getDayIndex(artist.endDay)
  const daysDiff = Math.max(0, endDayIdx - startDayIdx)
  const startMin = timeToMinutes(artist.startTime)
  const endMin = timeToMinutes(artist.endTime)
  return daysDiff * MINUTES_PER_DAY + (endMin - startMin)
}

function festivalOffsetToSlot(minutesFromStart: number): { day: ProgramDayId; time: string } {
  const startDayIdx = PROGRAM_DAY_ORDER.indexOf(FESTIVAL_CONFIG.programStartDay)
  const festivalStartMin = timeToMinutes(FESTIVAL_CONFIG.programStartTime)
  const absoluteMin = festivalStartMin + minutesFromStart
  const dayOffset = Math.floor(absoluteMin / MINUTES_PER_DAY)
  const timeMin = ((absoluteMin % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const dayIdx = Math.min(startDayIdx + dayOffset, PROGRAM_DAY_ORDER.length - 1)

  return {
    day: PROGRAM_DAY_ORDER[dayIdx],
    time: formatTime(timeMin),
  }
}

function createMimoBlock(
  offsetMinutes: number,
  durationMinutes: number,
  name: string,
  placeholderKind: NonNullable<Artist["placeholderKind"]>,
  index: number,
): Artist {
  const start = festivalOffsetToSlot(offsetMinutes)
  const end = festivalOffsetToSlot(offsetMinutes + durationMinutes)

  return {
    id: `mimo-${placeholderKind}-${index}`,
    name,
    startTime: start.time,
    endTime: end.time,
    startDay: start.day,
    endDay: end.day,
    stage: "Mimo",
    placeholderKind,
  }
}

function generateMimoPlaceholderBlocks(totalFestivalMinutes: number): Artist[] {
  const blocks: Artist[] = []
  let offset = 0
  let index = 0

  while (offset < totalFestivalMinutes) {
    const programDuration = Math.min(MIMO_PROGRAM_BLOCK_MINUTES, totalFestivalMinutes - offset)
    if (programDuration > 0) {
      blocks.push(
        createMimoBlock(
          offset,
          programDuration,
          "check program at stage",
          "stage-program",
          index++,
        ),
      )
      offset += programDuration
    }

    if (offset >= totalFestivalMinutes) break

    const pauseDuration = Math.min(MIMO_PAUSE_MINUTES, totalFestivalMinutes - offset)
    if (pauseDuration > 0) {
      offset += pauseDuration
    }
  }

  return blocks
}

function getStageArtists(stageId: string, timetable: Artist[], totalMinutes: number) {
  if (stageId === "Mimo") {
    return generateMimoPlaceholderBlocks(totalMinutes)
  }

  return timetable.filter(
    (artist) => artist.stage === stageId && artist.placeholderKind !== "pause",
  )
}

function getArtistInterval(artist: Artist) {
  const start = getMinutesSinceFestivalStart(artist)
  return { start, end: start + getArtistDuration(artist) }
}

function assignArtistLanes(artists: Artist[]) {
  const sorted = [...artists].sort((a, b) => {
    const startDiff = getMinutesSinceFestivalStart(a) - getMinutesSinceFestivalStart(b)
    if (startDiff !== 0) return startDiff
    return getArtistDuration(b) - getArtistDuration(a)
  })

  const laneEnds: number[] = []
  const lanes = new Map<string, number>()

  for (const artist of sorted) {
    const { start, end } = getArtistInterval(artist)
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start)

    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(end)
    } else {
      laneEnds[lane] = end
    }

    lanes.set(artist.id, lane)
  }

  return { lanes, laneCount: Math.max(1, laneEnds.length) }
}

function getStageLaneLayout(stageId: string, artists: Artist[]) {
  if (MUSIC_STAGES.has(stageId)) {
    return {
      laneCount: 1,
      timelineHeight: SINGLE_LANE_HEIGHT,
      getLane: () => 0,
      getLaneTop: () => 0,
      getLaneHeight: () => SINGLE_LANE_HEIGHT,
    }
  }

  const { lanes, laneCount } = assignArtistLanes(artists)
  const timelineHeight =
    laneCount === 1
      ? SINGLE_LANE_HEIGHT
      : laneCount * STACKED_LANE_HEIGHT + (laneCount - 1) * STACKED_LANE_GAP

  return {
    laneCount,
    timelineHeight,
    getLane: (artistId: string) => lanes.get(artistId) ?? 0,
    getLaneTop: (lane: number) =>
      laneCount === 1 ? 0 : lane * (STACKED_LANE_HEIGHT + STACKED_LANE_GAP),
    getLaneHeight: () => (laneCount === 1 ? SINGLE_LANE_HEIGHT : STACKED_LANE_HEIGHT),
  }
}

function getArtistBlockClassName(artist: Artist, isFav: boolean) {
  if (artist.placeholderKind === "stage-program") {
    return "border-dashed bg-white/55 border-black/70 cursor-default dark:bg-black/45 dark:border-white/70"
  }

  if (artist.placeholderKind === "pause") {
    return "border-dashed bg-transparent border-black/25 cursor-default dark:border-white/25"
  }

  if (isFav) {
    return "bg-black border-black dark:bg-white dark:border-white"
  }

  return "bg-white/80 border-black hover:bg-black dark:bg-black/60 dark:border-white dark:hover:bg-white"
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

function getActiveDayFromMinutes(
  scrollMinutes: number,
  dayStartMinutes: Record<ProgramDayId, number>,
): ProgramDayId {
  let foundDay: ProgramDayId = PROGRAM_DAY_ORDER[0]

  for (const day of PROGRAM_DAY_ORDER) {
    if (scrollMinutes >= dayStartMinutes[day]) {
      foundDay = day
    }
  }

  return foundDay
}

interface TimetableViewProps {
  data: OfflineData | null
  isLoading: boolean
  error: string | null
}

export default function TimetableView({ data, isLoading, error }: TimetableViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const dayTabsScrollRef = useRef<HTMLDivElement>(null)
  const dayButtonRefs = useRef<Map<ProgramDayId, HTMLButtonElement>>(new Map())
  const { isFavorite, toggleFavorite } = useFavorites()
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)
  const [activeDay, setActiveDay] = useState<ProgramDayId>(FESTIVAL_CONFIG.programStartDay)
  const [selectedArtist, setSelectedArtist] = useState<ArtistWithSlots | null>(null)

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

  // Keep the active day tab visible in the horizontal day strip
  useEffect(() => {
    const container = dayTabsScrollRef.current
    const activeDayButton = dayButtonRefs.current.get(activeDay)
    if (!container || !activeDayButton) return

    const containerRect = container.getBoundingClientRect()
    const buttonRect = activeDayButton.getBoundingClientRect()
    const buttonLeft = buttonRect.left - containerRect.left + container.scrollLeft
    const buttonWidth = buttonRect.width
    const containerWidth = containerRect.width
    const targetScrollLeft = buttonLeft - (containerWidth - buttonWidth) / 2

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    })
  }, [activeDay])

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
    
    const foundDay = getActiveDayFromMinutes(scrollMinutes, dayStartMinutes)

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
        <div className="overflow-x-auto hide-scrollbar" ref={dayTabsScrollRef}>
          <div className="flex gap-2 px-4 py-3" style={{ minWidth: 'max-content' }}>
            {PROGRAM_DAY_ORDER.map((day) => (
              <Button
                key={day}
                ref={(element) => {
                  if (element) {
                    dayButtonRefs.current.set(day, element)
                  } else {
                    dayButtonRefs.current.delete(day)
                  }
                }}
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
            {/* Time labels - sticky top so they stay visible while scrolling stages */}
            <div
              className="sticky top-0 z-30 flex relative px-4 bg-white/80 backdrop-blur-sm mix-blend-multiply dark:bg-black/80 dark:mix-blend-normal"
              style={{ width: timelineWidth }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none">
                <HourGridLines hours={totalHours} />
              </div>
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
              <div className="absolute inset-0 z-0 pointer-events-none">
                <HourGridLines hours={totalHours} />
              </div>
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
              {stages.map((stage) => {
                const stageArtists = getStageArtists(stage.id, timetable, totalMinutes)
                const laneLayout = getStageLaneLayout(stage.id, stageArtists)
                const stageRowHeight = 24 + 8 + laneLayout.timelineHeight

                return (
                <div key={stage.id} className="relative" style={{ height: `${stageRowHeight}px`, width: timelineWidth, marginBottom: "16px" }}>
                  {/* Sticky stagenaam above the artist row */}
                  <div
                    className="pointer-events-none text-xs font-bold text-black px-2 py-1 z-30 border border-black sticky left-0 lowercase mix-blend-multiply dark:border-white dark:mix-blend-normal"
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
                  <div className="relative" style={{ height: `${laneLayout.timelineHeight}px`, width: timelineWidth, marginTop: "8px" }}>
                    {stageArtists.map((artist) => {
                      const left = getMinutesSinceFestivalStart(artist) * PIXELS_PER_MINUTE;
                      const width = getArtistDuration(artist) * PIXELS_PER_MINUTE;
                      const lane = laneLayout.getLane(artist.id);
                      const laneTop = laneLayout.getLaneTop(lane);
                      const laneHeight = laneLayout.getLaneHeight();
                      const favoriteId = toArtistFavoriteId(artist.name);
                      const isFav = isFavorite(favoriteId);
                      const isPlaceholder = Boolean(artist.placeholderKind);
                      const isInteractive = !isPlaceholder;
                      const isStacked = laneLayout.laneCount > 1;
                      return (
                        <div
                          key={artist.id}
                          role={isInteractive ? "button" : undefined}
                          tabIndex={isInteractive ? 0 : undefined}
                          className={`absolute z-10 border transition-colors group flex flex-col justify-between overflow-hidden ${
                            isInteractive ? "dark:mix-blend-normal" : "mix-blend-multiply dark:mix-blend-normal"
                          } ${
                            getArtistBlockClassName(artist, isFav)
                          } ${isInteractive ? "cursor-pointer" : ""}`}
                          style={{
                            left: `${left}px`,
                            width: `${width}px`,
                            top: `${laneTop}px`,
                            height: `${laneHeight}px`,
                            minWidth: "60px",
                          }}
                          onClick={
                            isInteractive
                              ? () => setSelectedArtist(buildArtistWithSlots(artist.name, timetable))
                              : undefined
                          }
                          onKeyDown={
                            isInteractive
                              ? (event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault()
                                    setSelectedArtist(buildArtistWithSlots(artist.name, timetable))
                                  }
                                }
                              : undefined
                          }
                        >
                          {isInteractive && (
                            <div className="absolute top-1 right-1 z-10">
                              <span
                                onClick={e => {
                                  e.stopPropagation()
                                  toggleFavorite(favoriteId, {
                                    artistName: artist.name,
                                    artistCategory: getArtistCategory(artist),
                                    source: "timetable",
                                  })
                                }}
                                className="inline-flex items-center justify-center"
                              >
                                <FavoriteStarIcon filled={isFav} />
                              </span>
                            </div>
                          )}
                          <div className={`h-full flex flex-col justify-between ${isStacked ? "p-1.5" : "p-2"}`}>
                            {artist.placeholderKind !== "pause" && (
                              <>
                                <div 
                                  className={`font-bold lowercase leading-tight ${
                                    isStacked ? "text-[11px] line-clamp-2" : "text-xs truncate"
                                  } ${
                                    artist.placeholderKind === "stage-program"
                                      ? "text-black/70 whitespace-normal dark:text-white/75"
                                      : isFav
                                        ? "text-white dark:text-black"
                                        : "text-[#222] group-hover:text-white dark:text-[#f7f3e7] dark:group-hover:text-black"
                                  }`}
                                >
                                  {artist.name}
                                </div>
                                <div className={`font-bold lowercase ${
                                  isStacked ? "text-[10px]" : "text-xs"
                                } ${
                                  artist.placeholderKind
                                    ? "text-black/45 dark:text-white/45"
                                    : isFav
                                      ? "text-white/80 dark:text-black/75"
                                      : "text-black/55 group-hover:text-white/80 dark:text-white/60 dark:group-hover:text-black/75"
                                }`}>
                                  {formatArtistTimeRange(artist)}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )
              })}
              {/* Add bottom padding for scroll space */}
              <div style={{ height: "80px" }}></div>
            </div>
          </div>
        </div>
      </div>

      <ArtistDetailSheet
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
        source="timetable"
      />
    </div>
  )
}
