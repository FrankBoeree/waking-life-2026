"use client"

import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import type { OfflineData } from "@/lib/offline-storage"

interface LineupArtist {
  id: string
  name: string
  slots: Artist[]
}

interface LineupViewProps {
  showFavoritesOnly: boolean
  data: OfflineData | null
}

function toLineupId(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
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

// Kept in sync with `stages` in data/timetable.ts. Defined locally to avoid
// pulling the bundled festival JSON into this client component's bundle.
const STAGE_COLORS: Record<string, string> = {
  Floresta: "#8b5cf6",
  Praia: "#06b6d4",
  "Outro Lado": "#10b981",
  Mimo: "#f59e0b",
  Cochilo: "#84cc16",
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

function SlotLine({ slot }: { slot: Artist }) {
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

export default function LineupView({ showFavoritesOnly, data }: LineupViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArtist, setSelectedArtist] = useState<LineupArtist | null>(null)
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null)
  const { isFavorite, toggleFavorite } = useFavorites()

  const lineupArtists = useMemo(() => {
    const byId = new Map<string, { name: string; slots: Artist[] }>()

    for (const slot of data?.timetable || []) {
      if (slot.placeholderKind || slot.name.toLowerCase() === "a pausa") continue

      const id = toLineupId(slot.name)
      const existing = byId.get(id)
      if (existing) {
        existing.slots.push(slot)
      } else {
        byId.set(id, { name: slot.name, slots: [slot] })
      }
    }

    return [...byId.entries()]
      .map(([id, { name, slots }]) => ({
        id,
        name,
        slots: sortSlots(slots),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data?.timetable])

  const filteredArtists = lineupArtists
    .filter((artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((artist) => !showFavoritesOnly || isFavorite(artist.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (!selectedArtist) {
      setArtistInfo(null)
      return
    }

    setArtistInfo(getArtistInfo(selectedArtist.name))
  }, [selectedArtist])

  const selectedIsFavorite = selectedArtist
    ? isFavorite(selectedArtist.id)
    : false

  return (
    <div className="p-4 text-[#222] dark:text-[#f7f3e7]">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/55 dark:text-white/60 w-4 h-4" />
        <Input
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-none border-2 border-black bg-white/70 pl-10 font-bold lowercase text-[#222] placeholder:text-black/45 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-white dark:bg-black/60 dark:text-[#f7f3e7] dark:placeholder:text-white/45"
        />
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => {
          const isFav = isFavorite(artist.id)
          const primarySlot = artist.slots[0]
          const extraSlots = artist.slots.length - 1
          
          return (
            <div 
              key={artist.id} 
              className={`relative min-h-32 cursor-pointer border transition-colors group mix-blend-multiply dark:mix-blend-normal ${
                isFav
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' 
                  : 'border-black bg-white/80 text-[#222] hover:bg-black hover:text-white dark:border-white dark:bg-black/60 dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black'
              }`}
              onClick={() => setSelectedArtist(artist)}
            >
              {/* Favorite button */}
              <div className="absolute top-2 right-2 z-10">
                <span
                  onClick={e => { e.stopPropagation(); toggleFavorite(artist.id); }}
                  className="inline-flex items-center justify-center"
                >
                  <Star className={`w-5 h-5 ${isFav ? "fill-current text-yellow-400" : ""}`} strokeWidth={1.75} />
                </span>
              </div>

              {/* Content */}
              <div className="p-4 h-full flex flex-col justify-between">
                {/* Artist name */}
                <div className="pr-8 text-lg font-bold lowercase leading-tight">
                  {artist.name}
                </div>
                
                {primarySlot && (
                  <div className={`text-sm font-bold lowercase leading-snug ${
                    isFav
                      ? 'text-white/80 dark:text-black/75'
                      : 'text-black/55 group-hover:text-white/80 dark:text-white/60 dark:group-hover:text-black/75'
                  }`}>
                    <SlotLine slot={primarySlot} />
                    {extraSlots > 0 && (
                      <div className="mt-1 text-xs opacity-80">
                        +{extraSlots} more set{extraSlots > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12 text-black/60 dark:text-white/60">
          <p>No artists found matching your search.</p>
        </div>
      )}

      <Sheet
        open={Boolean(selectedArtist)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedArtist(null)
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="flex h-[70vh] flex-col border-2 border-b-0 border-black bg-white/95 p-0 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f7f3e7]"
        >
          {selectedArtist && (
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
                    {artistInfo?.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="border border-black/35 px-2 py-1 text-xs font-bold uppercase text-black/65 dark:border-white/35 dark:text-white/65"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <SheetTitle className="text-3xl font-black lowercase leading-none text-[#222] dark:text-[#f7f3e7]">
                    {selectedArtist.name}
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Artist information and favorite controls for {selectedArtist.name}
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
                {selectedArtist.slots.length > 0 && (
                  <div className="mb-5 border border-black/30 p-3 dark:border-white/30">
                    <div className="mb-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
                      timetable
                    </div>
                    <div className="space-y-2">
                      {selectedArtist.slots.map((slot) => (
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

                {artistInfo && (artistInfo.bio || artistInfo.labels.length > 0 || artistInfo.festivals.length > 0) && (
                  <div className="space-y-5">
                    {artistInfo.bio && (
                      <p className="max-w-3xl text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
                        {artistInfo.bio}
                      </p>
                    )}

                    {(artistInfo.labels.length > 0 ||
                      artistInfo.festivals.length > 0) && (
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
                  onClick={() => toggleFavorite(selectedArtist.id)}
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
    </div>
  )
}
