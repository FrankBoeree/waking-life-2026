"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { trackFavoriteChange, type FavoriteSource } from "@/lib/analytics"
import {
  adjustFavoriteCount,
  fetchFavoriteCounts,
  type FavoriteCountsMap,
} from "@/lib/favorite-counts"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { offlineStorage } from "@/lib/offline-storage"

export interface FavoriteToggleMeta {
  artistName?: string
  artistCategory?: string
  source: FavoriteSource
}

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (artistId: string, meta?: FavoriteToggleMeta) => void
  isFavorite: (artistId: string) => boolean
  getFavoriteCount: (artistId: string) => number
  favoriteCounts: FavoriteCountsMap
  isLoading: boolean
  isCountsLoading: boolean
  isOnline: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteCounts, setFavoriteCounts] = useState<FavoriteCountsMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCountsLoading, setIsCountsLoading] = useState(isSupabaseConfigured())
  const [isOnline, setIsOnline] = useState(true)

  const loadFavoriteCounts = useCallback(async () => {
    if (!isSupabaseConfigured() || !navigator.onLine) {
      setIsCountsLoading(false)
      return
    }

    setIsCountsLoading(true)
    try {
      const counts = await fetchFavoriteCounts()
      setFavoriteCounts(counts)
    } finally {
      setIsCountsLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await offlineStorage.getData("favorites")
        if (storedFavorites && Array.isArray(storedFavorites)) {
          setFavorites(storedFavorites)
        } else {
          const localStored = localStorage.getItem("festival-favorites")
          if (localStored) {
            const parsed = JSON.parse(localStored)
            setFavorites(parsed)
            await offlineStorage.saveData("favorites", parsed)
          }
        }
      } catch (error) {
        console.error("Error loading favorites:", error)
        const localStored = localStorage.getItem("festival-favorites")
        if (localStored) {
          setFavorites(JSON.parse(localStored))
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadFavorites()
    void loadFavoriteCounts()
  }, [loadFavoriteCounts])

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      if (online) {
        void loadFavoriteCounts()
      }
    }

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [loadFavoriteCounts])

  const getFavoriteCount = useCallback(
    (artistId: string) => favoriteCounts[artistId] ?? 0,
    [favoriteCounts],
  )

  const toggleFavorite = async (artistId: string, meta?: FavoriteToggleMeta) => {
    let isRemoving = false
    let delta: -1 | 1 = 1

    setFavorites((prev) => {
      isRemoving = prev.includes(artistId)
      delta = isRemoving ? -1 : 1
      const newFavorites = isRemoving
        ? prev.filter((id) => id !== artistId)
        : [...prev, artistId]

      if (meta) {
        trackFavoriteChange({
          artistId,
          artistName: meta.artistName,
          artistCategory: meta.artistCategory,
          source: meta.source,
          action: isRemoving ? "remove" : "add",
        })
      }

      localStorage.setItem("festival-favorites", JSON.stringify(newFavorites))
      offlineStorage.saveData("favorites", newFavorites).catch((error) => {
        console.error("Error saving favorites to IndexedDB:", error)
      })

      return newFavorites
    })

    if (!isSupabaseConfigured() || !navigator.onLine) return

    setFavoriteCounts((prev) => {
      const current = prev[artistId] ?? 0
      const next = Math.max(0, current + delta)
      return { ...prev, [artistId]: next }
    })

    const serverCount = await adjustFavoriteCount(
      artistId,
      meta?.artistName,
      delta as -1 | 1,
    )

    if (serverCount === null) {
      setFavoriteCounts((prev) => {
        const current = prev[artistId] ?? 0
        const rolledBack = Math.max(0, current - delta)
        if (rolledBack === 0) {
          const { [artistId]: _removed, ...rest } = prev
          return rest
        }
        return { ...prev, [artistId]: rolledBack }
      })
      return
    }

    setFavoriteCounts((prev) => ({ ...prev, [artistId]: serverCount }))
  }

  const isFavorite = (artistId: string) => favorites.includes(artistId)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        getFavoriteCount,
        favoriteCounts,
        isLoading,
        isCountsLoading,
        isOnline,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
