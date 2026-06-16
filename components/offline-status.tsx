"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Wifi, WifiOff, HardDrive, RefreshCw } from 'lucide-react'
import { offlineStorage } from '@/lib/offline-storage'
import { useOfflineData } from '@/hooks/use-offline-data'

export function OfflineStatus() {
  const { data, isLoading, refreshData, isOnline } = useOfflineData()
  const [storageInfo, setStorageInfo] = useState<{ used: number; available: number } | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const getStorageInfo = async () => {
      try {
        const info = await offlineStorage.getStorageInfo()
        setStorageInfo(info)
      } catch (error) {
        console.error('Error getting storage info:', error)
      }
    }

    getStorageInfo()
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStoragePercentage = () => {
    if (!storageInfo || storageInfo.available === 0) return 0
    return (storageInfo.used / storageInfo.available) * 100
  }

  if (!showDetails) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(true)}
          className="bg-background/80 backdrop-blur-sm border-border/50"
        >
          {isOnline ? (
            <Wifi className="h-4 w-4 mr-2" />
          ) : (
            <WifiOff className="h-4 w-4 mr-2" />
          )}
          Status
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Offline Status
          </CardTitle>
          <CardDescription>
            App status and storage information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {/* Data Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Timetable:</span>
              <Badge variant={data?.timetable.length ? "default" : "secondary"}>
                {data?.timetable.length || 0} artists
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Favorites:</span>
              <Badge variant={data?.favorites.length ? "default" : "secondary"}>
                {data?.favorites.length || 0} favorites
              </Badge>
            </div>
          </div>

          {/* Storage Info */}
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage used:</span>
                <span>{formatBytes(storageInfo.used)}</span>
              </div>
              <Progress value={getStoragePercentage()} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {formatBytes(storageInfo.used)} of {formatBytes(storageInfo.available)} used
              </div>
            </div>
          )}

          {/* Last Sync */}
          {data?.lastSync && (
            <div className="text-xs text-muted-foreground">
              Last sync: {new Date(data.lastSync).toLocaleString('en-US')}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
