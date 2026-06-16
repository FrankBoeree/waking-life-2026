"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Artist } from "@/data/timetable"
import { useFavorites } from "@/contexts/favorites-context"
import { getArtistInfo, type ArtistInfo } from "@/lib/artist-info"
import { PROGRAM_DAY_ORDER, type ProgramDayId } from "@/lib/festival-config"
import { toArtistFavoriteId } from "@/lib/artist-id"

export interface ArtistWithSlots {
  id: string
  name: string
  slots: Artist[]
}

const STAGE_COLORS: Record<string, string> = {
  Floresta: "#8b5cf6",
  Praia: "#06b6d4",
  "Outro Lado": "#10b981",
  Mimo: "#f59e0b",
  Cochilo: "#84cc16",
}

function isOpenEndTime(time: string) {
  return !time || time === "--" || time === "..:.."
}

function formatTimeRange(slot: Artist) {
  const endTime = isOpenEndTime(slot.endTime) ? "..:.." : slot.endTime
  return `${slot.startTime}–${endTime}`
}

function formatDayLabel(day?: string) {
  if (!day) return ""
  return day.slice(0, 3)
}

function getStageColor(stageId: string) {
  return STAGE_COLORS[stageId]
}

function formatSlotMeta(slot: Artist) {
  const day = formatDayLabel(slot.startDay)
  return `${day} ${formatTimeRange(slot)}`
}

function StageDot({ stage }: { stage: string }) {
  const color = getStageColor(stage)
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 flex-shrink-0 border border-black/40 dark:border-white/40"
      style={{ backgroundColor: color ?? "transparent" }}
    />
  )
}

export function SlotLine({ slot }: { slot: Artist }) {
  return (
    <div className="flex items-center gap-2 leading-snug">
      <StageDot stage={slot.stage} />
      <span>{`${slot.stage.toLowerCase()} · ${formatSlotMeta(slot)}`}</span>
    </div>
  )
}

function slotSortKey(slot: Artist) {
  const dayIndex = PROGRAM_DAY_ORDER.indexOf(slot.startDay as ProgramDayId)
  const [hours, minutes] = slot.startTime.split(":").map(Number)
  return dayIndex * 24 * 60 + hours * 60 + minutes
}

function sortSlots(slots: Artist[]) {
  return [...slots].sort((a, b) => slotSortKey(a) - slotSortKey(b))
}

export function buildArtistWithSlots(name: string, timetable: Artist[]): ArtistWithSlots {
  const id = toArtistFavoriteId(name)
  const slots = sortSlots(
    timetable.filter(
      (slot) =>
        !slot.placeholderKind &&
        toArtistFavoriteId(slot.name) === id,
    ),
  )

  return { id, name, slots }
}

interface ArtistDetailSheetProps {
  artist: ArtistWithSlots | null
  onClose: () => void
}

export function ArtistDetailSheet({ artist, onClose }: ArtistDetailSheetProps) {
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null)
  const { isFavorite, toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!artist) {
      setArtistInfo(null)
      return
    }

    setArtistInfo(getArtistInfo(artist.name))
  }, [artist])

  const selectedIsFavorite = artist ? isFavorite(artist.id) : false

  return (
    <Sheet
      open={Boolean(artist)}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="flex h-[70vh] flex-col border-2 border-b-0 border-black bg-white/95 p-0 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f7f3e7]"
      >
        {artist && (
          <>
            <SheetHeader className="relative border-b border-black/25 px-5 pb-4 pt-5 text-left dark:border-white/25">
              <div className="pr-12">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {artistInfo?.flag && artistInfo.country && (
                    <span className="inline-flex items-center gap-2 border border-black px-2 py-1 text-xs font-bold uppercase tracking-normal dark:border-white">
                      <span aria-hidden="true">{artistInfo.flag}</span>
                      {artistInfo.country}
                    </span>
                  )}
                  {artistInfo?.isLive !== undefined && (
                    <span className="border border-black px-2 py-1 text-xs font-bold uppercase tracking-normal dark:border-white">
                      {artistInfo.isLive ? "live" : "dj set"}
                    </span>
                  )}
                  {artistInfo?.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="border border-black/35 px-2 py-1 text-xs font-bold uppercase text-black/65 dark:border-white/35 dark:text-white/65"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <SheetTitle className="text-3xl font-black lowercase leading-none text-[#222] dark:text-[#f7f3e7]">
                  {artist.name}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Artist information and favorite controls for {artist.name}
                </SheetDescription>
                {artistInfo?.residentAdvisorUrl && (
                  <a
                    href={artistInfo.residentAdvisorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 border border-black px-3 py-2 text-sm font-black lowercase text-[#222] transition-colors hover:bg-black hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                  >
                    Resident Advisor profile & events
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </SheetHeader>

            <div className="min-h-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden px-5 pb-10 pt-5">
              {artist.slots.length > 0 && (
                <div className="mb-5 border border-black/30 p-3 dark:border-white/30">
                  <div className="mb-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
                    timetable
                  </div>
                  <div className="space-y-2">
                    {artist.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="text-sm font-bold lowercase text-black/75 dark:text-white/75"
                      >
                        <SlotLine slot={slot} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {artistInfo &&
                (artistInfo.bio ||
                  artistInfo.labels.length > 0 ||
                  artistInfo.festivals.length > 0) && (
                  <div className="space-y-5">
                    {artistInfo.bio && (
                      <p className="max-w-3xl text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
                        {artistInfo.bio}
                      </p>
                    )}

                    {(artistInfo.labels.length > 0 || artistInfo.festivals.length > 0) && (
                      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
                        {artistInfo.labels.length > 0 && (
                          <div className="border border-black/30 p-3 dark:border-white/30">
                            <div className="mb-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
                              labels
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {artistInfo.labels.map((label) => (
                                <span
                                  key={label}
                                  className="border border-black px-2 py-1 text-sm font-bold lowercase dark:border-white"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {artistInfo.festivals.length > 0 && (
                          <div className="border border-black/30 p-3 dark:border-white/30">
                            <div className="mb-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
                              festival mentions
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {artistInfo.festivals.map((festival) => (
                                <span
                                  key={festival}
                                  className="border border-black px-2 py-1 text-sm font-bold lowercase dark:border-white"
                                >
                                  {festival}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {artistInfo?.sourceUrl && (
                <a
                  href={artistInfo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold lowercase text-black/60 underline decoration-2 underline-offset-4 hover:text-black dark:text-white/60 dark:hover:text-white"
                >
                  {artistInfo.sourceLabel}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            <SheetFooter className="relative z-10 shrink-0 flex-col border-t border-black/25 bg-white/95 px-5 py-4 backdrop-blur-md dark:border-white/25 dark:bg-[#111]/95 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                onClick={() => toggleFavorite(artist.id)}
                className={`h-12 rounded-none border-2 text-base font-black lowercase ${
                  selectedIsFavorite
                    ? "border-black bg-black text-white hover:bg-black/85 dark:border-white dark:bg-white dark:text-black dark:hover:bg-white/85"
                    : "border-black bg-transparent text-[#222] hover:bg-black hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                }`}
              >
                <Star
                  className={`mr-2 h-5 w-5 ${selectedIsFavorite ? "fill-current text-yellow-400" : ""}`}
                  strokeWidth={1.75}
                />
                {selectedIsFavorite ? "remove from favorites" : "add to favorites"}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
