"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FESTIVAL_CONFIG } from "@/lib/festival-config"
import { trackShareApp } from "@/lib/analytics"

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false })

export function AppSharePanel() {
  const [open, setOpen] = useState(false)
  const shareUrl = FESTIVAL_CONFIG.siteUrl

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true)
          trackShareApp()
        }}
        className="border-black bg-transparent text-[#222] hover:bg-black hover:text-white dark:border-white dark:text-[#f7f3e7] dark:hover:bg-white dark:hover:text-black"
        aria-label="Share app with QR code"
        title="Share app"
      >
        <QrCode className="w-4 h-4" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[85vh] flex-col border-2 border-b-0 border-black bg-white/95 p-0 text-[#222] backdrop-blur-md dark:border-white dark:bg-[#111]/95 dark:text-[#f7f3e7]"
        >
          <SheetHeader className="border-b border-black/25 px-5 pb-4 pt-5 text-left dark:border-white/25">
            <SheetTitle className="text-3xl font-black lowercase leading-none text-[#222] dark:text-[#f7f3e7]">
              share the timetable
            </SheetTitle>
            <SheetDescription className="sr-only">
              QR code to open the Dekmantel Festival timetable app on another phone
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-10 pt-5">
            <p className="text-base font-bold leading-7 text-[#222] dark:text-[#f7f3e7]">
              scan this code to open the app on another phone.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="border-2 border-black bg-white p-4 dark:border-white">
                {open && (
                  <QRCode
                    value={shareUrl}
                    size={200}
                    level="M"
                    aria-label={`QR code linking to ${shareUrl}`}
                  />
                )}
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-bold lowercase text-black/55 dark:text-white/55">
              {shareUrl}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
