"use client"

import { useState } from "react"
import { Info, Smartphone, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"

function InstallSteps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="border border-black/30 p-4 dark:border-white/30">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-black/50 dark:text-white/50">
        <Smartphone className="h-3.5 w-3.5" />
        {title}
      </div>
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
    </div>
  )
}

export function AppInfoPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-black text-[#222] hover:bg-black hover:text-white dark:border-white dark:text-[#f5f0e8] dark:hover:bg-white dark:hover:text-black"
        aria-label="About this app and install instructions"
        title="About this app"
      >
        <Info className="w-4 h-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85vh] flex-col border-2 border-b-0 border-black bg-white/95 p-0 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f5f0e8]"
        >
          <SheetHeader className="border-b border-black/25 px-5 pb-4 pt-5 text-left dark:border-white/25">
            <SheetTitle className="text-3xl font-black lowercase leading-none text-[#222] dark:text-[#f5f0e8]">
              about this timetable
            </SheetTitle>
            <SheetDescription className="sr-only">
              About the Dekmantel Festival timetable app, install instructions, and dance floor etiquette
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-5">
            <div className="space-y-5">
              <p className="text-base font-bold leading-7 text-[#222] dark:text-[#f5f0e8]">
                check who&apos;s on, star your picks, and glance at set times when you need them.
                then pocket your phone and stay with the music. this is an unofficial companion —
                not affiliated with{" "}
                <a
                  href="https://dekmantelfestival.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-2 underline-offset-4"
                >
                  Dekmantel organizers
                </a>
                .
              </p>

              <div className="border-2 border-black p-4 dark:border-white">
                <p className="text-sm font-black uppercase tracking-wide text-black/50 dark:text-white/50">
                  dance floor
                </p>
                <p className="mt-2 text-base font-bold leading-7 text-[#222] dark:text-[#f5f0e8]">
                  keep phones off the dance floor. no filming, no flashlights, no screens between
                  you and the music. check your timetable before you step in — then dance.
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-black uppercase text-black/50 dark:text-white/50">
                  add to home screen
                </p>
                <p className="mb-4 text-sm font-bold lowercase leading-relaxed text-black/65 dark:text-white/65">
                  install the app for quick access and full offline use — even when signal drops in
                  the Amsterdamse Bos.
                </p>
                <div className="grid gap-4">
                  <InstallSteps
                    title="iphone"
                    steps={[
                      "open this page in safari",
                      'tap the share button (square with an arrow pointing up)',
                      'scroll down and tap "add to home screen"',
                      'tap "add"',
                    ]}
                  />
                  <InstallSteps
                    title="android"
                    steps={[
                      "open this page in chrome",
                      'tap the menu (three dots, top right)',
                      'tap "add to home screen" or "install app"',
                      'confirm with "add" or "install"',
                    ]}
                  />
                </div>
              </div>

              <div className="border-t border-black/25 pt-5 text-center dark:border-white/25">
                <p className="mb-5 text-sm font-bold lowercase leading-relaxed text-black/75 dark:text-white/75">
                  updated for Dekmantel Festival 2026 ({FESTIVAL_CONFIG.officialDateRange}).
                  unofficial, fan-made, and always subject to last-minute changes on site.
                </p>
                <p className="mb-3 text-sm font-bold lowercase leading-relaxed text-black/75 dark:text-white/75">
                  useful app? a small tip helps keep it running for next year.
                </p>
                <a
                  href={FESTIVAL_CONFIG.beerDonationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-black px-4 py-3 text-sm font-black lowercase text-[#222] transition-colors hover:bg-black hover:text-white dark:border-white dark:text-[#f5f0e8] dark:hover:bg-white dark:hover:text-black"
                >
                  <Sparkles className="h-4 w-4" />
                  send a tip
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
