"use client"

import { useMemo, useRef, useState } from "react"
import { Search, Star, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Artist } from "@/data/timetable"
import { useFavorites } from "@/contexts/favorites-context"
import { PROGRAM_DAY_ORDER, type ProgramDayId } from "@/lib/festival-config"
import { toArtistFavoriteId } from "@/lib/artist-id"
import type { OfflineData } from "@/lib/offline-storage"
import {
  ArtistDetailSheet,
  SlotLine,
  type ArtistWithSlots,
} from "@/components/artist-detail-sheet"

interface LineupViewProps {
  showFavoritesOnly: boolean
  data: OfflineData | null
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
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [selectedArtist, setSelectedArtist] = useState<ArtistWithSlots | null>(null)
  const { isFavorite, toggleFavorite } = useFavorites()

  const lineupArtists = useMemo(() => {
    const byId = new Map<string, { name: string; slots: Artist[] }>()

    for (const slot of data?.timetable || []) {
      if (slot.placeholderKind) continue

      const id = toArtistFavoriteId(slot.name)
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

  return (
    <div className="p-4 text-[#222] dark:text-[#f7f3e7]">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/55 dark:text-white/60 w-4 h-4" />
        <Input
          ref={searchInputRef}
          placeholder="Search artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-none border-2 border-black bg-white/70 pl-10 pr-10 font-bold lowercase text-[#222] placeholder:text-black/45 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-white dark:bg-black/60 dark:text-[#f7f3e7] dark:placeholder:text-white/45"
        />
        {searchTerm && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setSearchTerm("")
              searchInputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black/55 hover:text-black dark:text-white/60 dark:hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
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

      <ArtistDetailSheet
        artist={selectedArtist}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  )
}
