"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-500/20 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-white text-2xl">No internet connection found</CardTitle>
          <CardDescription className="text-gray-300">
            Don&apos;t worry! This app works completely offline. You can still:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm">
            <ul className="text-left space-y-2 text-gray-300">
              <li>• View your saved favorites</li>
              <li>• Check the festival timetable</li>
              <li>• Browse the complete lineup</li>
              <li>• Modify your favorites (will be saved)</li>
            </ul>
          </div>

          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 
