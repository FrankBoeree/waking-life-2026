"use client"

import { useEffect, useState } from "react"
import { initializeOfflineCapabilities } from "@/lib/offline-storage"
import { useFavorites } from "@/contexts/favorites-context"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineInitializer() {
  const [showStatus, setShowStatus] = useState(false)
  const { isOnline } = useFavorites()

  useEffect(() => {
    const init = async () => {
      try {
        await initializeOfflineCapabilities()
        
        // Show status briefly on first load
        setShowStatus(true)
        setTimeout(() => setShowStatus(false), 3000)
      } catch (error) {
        console.error('Failed to initialize offline capabilities:', error)
      }
    }

    init()
  }, [])

  // Show offline status when going offline
  useEffect(() => {
    if (!isOnline) {
      setShowStatus(true)
    } else {
      // Hide status after a delay when coming back online
      const timer = setTimeout(() => setShowStatus(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  if (!showStatus) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-2 px-3 py-2 shadow-lg"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Offline</span>
          </>
        )}
      </Badge>
    </div>
  )
} 
