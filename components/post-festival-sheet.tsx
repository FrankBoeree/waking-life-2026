"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { timetable as staticTimetable, type Artist } from "@/data/timetable"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import { isFestivalOver } from "@/lib/festival-dates"

interface PostFestivalSheetProps {
  timetable?: Artist[]
}

export function PostFestivalSheet({ timetable = staticTimetable }: PostFestivalSheetProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const festivalOver = mounted && isFestivalOver(new Date(), timetable)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (festivalOver) {
      setOpen(true)
    }
  }, [festivalOver])

  if (!festivalOver) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="flex max-h-[85vh] flex-col border-2 border-b-0 border-black bg-white/95 p-0 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f7f3e7]"
      >
        <SheetHeader className="border-b border-black/25 px-5 pb-4 pt-5 text-left dark:border-white/25">
          <SheetTitle className="text-3xl font-black lowercase leading-none text-[#222] dark:text-[#f7f3e7]">
            enjoyed the ride?
          </SheetTitle>
          <SheetDescription className="sr-only">
            Waking Life 2026 has ended — thank you for using the timetable app
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-5">
          <div className="space-y-5">
            <p className="text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
              the lake goes quiet. the forest exhales. another waking life drifts into memory.
            </p>

            <p className="text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
              if this little compass helped you find your way, miss a set on purpose, or wander into
              something better than planned, you can leave a tiny offering for its next incarnation.
            </p>

            <p className="text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
              keep it on your home screen. {FESTIVAL_CONFIG.nextEditionYear} is already blinking in
              the distance.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <div className="border-2 border-black dark:border-white">
                <a
                  href={FESTIVAL_CONFIG.beerDonationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 bg-transparent px-4 py-3 text-sm font-black lowercase text-[#222] outline-none ring-0 shadow-none transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-black hover:text-white focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                >
                  <Sparkles className="h-4 w-4" />
                  send a spark
                </a>
              </div>
              <div className="border-2 border-black dark:border-white">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setOpen(false)
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 bg-transparent px-4 py-3 text-sm font-black lowercase text-[#222] outline-none ring-0 shadow-none transition-colors [-webkit-tap-highlight-color:transparent] hover:bg-black hover:text-white focus:outline-none focus:ring-0 focus:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:shadow-none dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
                >
                  close
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
