"use client"

import { useEffect, useState } from "react"
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
import { stages, days, type Artist } from "@/data/timetable"
import { useFavorites } from "@/contexts/favorites-context"
import { useOfflineData } from "@/hooks/use-offline-data"
import { getArtistInfo, type ArtistInfo } from "@/lib/artist-info"

interface LineupViewProps {
  showFavoritesOnly: boolean
}

export default function LineupView({ showFavoritesOnly }: LineupViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [artistInfo, setArtistInfo] = useState<ArtistInfo | null>(null)
  const { isFavorite, toggleFavorite } = useFavorites()
  const { data, isLoading, error } = useOfflineData()

  // Use offline data if available, fallback to static imports
  const timetable = data?.timetable || []

  const filteredArtists = timetable
    .filter((artist) =>
      artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((artist) => !showFavoritesOnly || isFavorite(artist.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Helper function to format date DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Helper function to get day info
  const getDayInfo = (artist: Artist) => {
    // Use startDay if available, otherwise fall back to day
    const dayId = artist.startDay || artist.day
    const day = days.find((d) => d.id === dayId)
    return day ? { name: day.name, date: formatDate(day.date) } : { name: 'Unknown', date: 'Unknown' }
  }

  useEffect(() => {
    if (!selectedArtist) {
      setArtistInfo(null)
      return
    }

    setArtistInfo(getArtistInfo(selectedArtist.name))
  }, [selectedArtist])

  const selectedStage = selectedArtist
    ? stages.find((stage) => stage.id === selectedArtist.stage)
    : undefined
  const selectedDayInfo = selectedArtist ? getDayInfo(selectedArtist) : undefined
  const selectedIsFavorite = selectedArtist
    ? isFavorite(selectedArtist.id)
    : false

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-black/60 dark:text-white/60">
          <p>Loading lineup...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-12 text-red-700 dark:text-red-300">
          <p>Error loading lineup: {error}</p>
        </div>
      </div>
    )
  }

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

      {/* Artists Grid - using timetable-style cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => {
          const isFav = isFavorite(artist.id)
          const stage = stages.find((s) => s.id === artist.stage)
          const dayInfo = getDayInfo(artist)
          
          return (
            <div 
              key={artist.id} 
              className={`relative h-32 cursor-pointer border transition-colors group mix-blend-multiply dark:mix-blend-normal ${
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
                <div className="truncate text-lg font-bold lowercase leading-tight">
                  {artist.name}
                </div>
                
                {/* Day and date */}
                <div className={`text-sm font-bold lowercase ${
                  isFav
                    ? 'text-white/80 dark:text-black/75'
                    : 'text-black/55 group-hover:text-white/80 dark:text-white/60 dark:group-hover:text-black/75'
                }`}>
                  {dayInfo.name} • {artist.startTime} - {artist.endTime}
                </div>
                
                {/* Stage name */}
                <div className={`flex items-center gap-2 text-sm font-bold lowercase ${
                  isFav
                    ? 'text-white/80 dark:text-black/75'
                    : 'text-black/70 group-hover:text-white/80 dark:text-white/70 dark:group-hover:text-black/75'
                }`}>
                  <div 
                    className="w-3 h-3 flex-shrink-0 border border-current"
                    style={{ backgroundColor: stage?.color || "#ec4899" }}
                  />
                  {stage?.name || 'Unknown Stage'}
                </div>
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
          className="flex h-[70vh] flex-col border-2 border-b-0 border-black bg-[#f7f3e7] p-0 text-[#222] dark:border-white dark:bg-black dark:text-[#f7f3e7]"
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
                <div className="mb-5 grid gap-3 text-sm font-bold lowercase text-black/70 dark:text-white/70">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 flex-shrink-0 border border-current"
                      style={{ backgroundColor: selectedStage?.color || "#ec4899" }}
                    />
                    {selectedStage?.name || "Unknown Stage"}
                  </div>
                  {selectedDayInfo && (
                    <div>
                      {selectedDayInfo.name} • {selectedArtist.startTime} - {selectedArtist.endTime}
                    </div>
                  )}
                </div>

                {artistInfo && (
                  <div className="space-y-5">
                    <p className="max-w-3xl text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
                      {artistInfo.bio}
                    </p>

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

              <SheetFooter className="relative z-10 shrink-0 flex-col border-t border-black/25 bg-[#f7f3e7] px-5 py-4 dark:border-white/25 dark:bg-black sm:flex-col sm:space-x-0">
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
