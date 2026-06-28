import { useState, useEffect } from 'react'
import { offlineStorage, refreshAppShell, OfflineData } from '@/lib/offline-storage'
import { timetable, type Artist } from '@/data/timetable'
import { FESTIVAL_CONFIG } from '@/lib/festival-config'

interface UseOfflineDataReturn {
  data: OfflineData | null
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
  isOnline: boolean
}

interface FestivalDataPayload {
  version: string
  timetable: Artist[]
}

async function fetchLatestFestivalData(): Promise<FestivalDataPayload> {
  const response = await fetch(`/festival-data.json?refresh=${Date.now()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch festival data: ${response.status}`)
  }

  const payload = await response.json()

  if (
    !payload ||
    typeof payload.version !== 'string' ||
    !Array.isArray(payload.timetable)
  ) {
    throw new Error('Festival data response has an invalid format')
  }

  return payload
}

export function useOfflineData(): UseOfflineDataReturn {
  const [data, setData] = useState<OfflineData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  const loadData = async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to load from IndexedDB first
      let offlineData: OfflineData | null = null
      
      try {
        offlineData = await offlineStorage.getAllData()
      } catch (dbError) {
        console.warn('IndexedDB not available, using static data:', dbError)
      }

      if (forceRefresh) {
        const latestData = await fetchLatestFestivalData()
        const lastSync = Date.now()
        const favorites = offlineData?.favorites || []

        const refreshedData = {
          timetable: latestData.timetable,
          favorites,
          lastSync,
          version: latestData.version,
        }

        setData(refreshedData)

        try {
          await offlineStorage.saveData('timetable', latestData.timetable)
          await offlineStorage.saveData('data-version', latestData.version)
          await offlineStorage.saveData('last-sync', lastSync)
        } catch (saveError) {
          console.warn('Failed to save refreshed data to IndexedDB:', saveError)
        }

        return
      }

      // If no data in IndexedDB or IndexedDB failed, use static imports
      if (
        !offlineData ||
        offlineData.version !== FESTIVAL_CONFIG.dataVersion
      ) {
        try {
          const latestData = await fetchLatestFestivalData()
          const lastSync = Date.now()

          offlineData = {
            timetable: latestData.timetable,
            favorites: offlineData?.favorites || [],
            lastSync,
            version: latestData.version
          }

          try {
            await offlineStorage.saveData('timetable', latestData.timetable)
            await offlineStorage.saveData('data-version', latestData.version)
            await offlineStorage.saveData('last-sync', lastSync)
          } catch (saveError) {
            console.warn('Failed to save latest data to IndexedDB:', saveError)
          }
        } catch (refreshError) {
          console.warn('Failed to fetch latest data, using bundled data:', refreshError)

          const lastSync = Date.now()

          offlineData = {
            timetable,
            favorites: offlineData?.favorites || [],
            lastSync,
            version: FESTIVAL_CONFIG.dataVersion
          }

          // Try to save to IndexedDB (but don't fail if it doesn't work)
          try {
            await offlineStorage.saveData('timetable', timetable)
            await offlineStorage.saveData('data-version', FESTIVAL_CONFIG.dataVersion)
            await offlineStorage.saveData('last-sync', lastSync)
          } catch (saveError) {
            console.warn('Failed to save to IndexedDB:', saveError)
          }
        }
      }

      setData(offlineData)
    } catch (err) {
      console.error('Error loading offline data:', err)
      if (!data) {
        setError('Failed to load data')
      }
      
      // Always provide fallback data
      setData((currentData) => currentData || {
        timetable,
        favorites: [],
        lastSync: Date.now(),
        version: FESTIVAL_CONFIG.dataVersion
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    if (!navigator.onLine) {
      setError('Connect to the internet to refresh the app')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const latestData = await fetchLatestFestivalData()
      const offlineData = await offlineStorage.getAllData().catch(() => null)
      const lastSync = Date.now()

      setData({
        timetable: latestData.timetable,
        favorites: offlineData?.favorites || [],
        lastSync,
        version: latestData.version,
      })

      try {
        await offlineStorage.saveData('timetable', latestData.timetable)
        await offlineStorage.saveData('data-version', latestData.version)
        await offlineStorage.saveData('last-sync', lastSync)
      } catch (saveError) {
        console.warn('Failed to save refreshed data to IndexedDB:', saveError)
      }
    } catch (err) {
      console.warn('Failed to refresh festival data before app reload:', err)
    }

    await refreshAppShell()
  }

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  return {
    data,
    isLoading,
    error,
    refreshData,
    isOnline
  }
}
