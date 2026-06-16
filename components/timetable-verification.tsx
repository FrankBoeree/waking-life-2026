"use client"

import { timetable, type Artist } from "@/data/timetable"

export default function TimetableVerification() {
  const HOUR_WIDTH = 200
  const timelineStartHour = 13

  const verifyArtistPosition = (artist: Artist) => {
    const [startHour, startMinute] = artist.startTime.split(":").map(Number)
    const [endHour, endMinute] = artist.endTime.split(":").map(Number)

    // Calculate start position
    const hoursFromStart = startHour - timelineStartHour
    const minutesIntoHour = startMinute
    const startPosition = hoursFromStart * HOUR_WIDTH + (minutesIntoHour / 60) * HOUR_WIDTH

    // Calculate duration and width
    let durationMinutes
    if (endHour === 0) {
      durationMinutes = (24 - startHour) * 60 - startMinute + endHour * 60 + endMinute
    } else {
      durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)
    }
    const width = (durationMinutes / 60) * HOUR_WIDTH

    return {
      artist: artist.name,
      time: `${artist.startTime} - ${artist.endTime}`,
      startPosition: Math.round(startPosition),
      width: Math.round(width),
      durationMinutes,
      calculation: {
        hoursFromStart,
        minutesIntoHour,
        expectedHourPosition: hoursFromStart * HOUR_WIDTH,
        minuteOffset: (minutesIntoHour / 60) * HOUR_WIDTH,
      },
    }
  }

  const fridayArtists = timetable.filter((artist) => artist.day === "friday")
  const verifications = fridayArtists.map(verifyArtistPosition)

  // Time header positions for reference
  const timePositions = []
  for (let hour = 13; hour <= 20; hour++) {
    const hourIndex = hour - 13
    const centerPosition = hourIndex * HOUR_WIDTH + HOUR_WIDTH / 2
    timePositions.push({
      time: `${hour.toString().padStart(2, "0")}:00`,
      centerPosition,
      gridLinePosition: centerPosition,
    })
  }

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Timeline Position Verification</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Time Header Positions (HOUR_WIDTH = {HOUR_WIDTH}px)</h3>
        <div className="space-y-1">
          {timePositions.map((pos, index) => (
            <div key={index} className="text-sm">
              <span className="font-mono">{pos.time}</span> - Center: {pos.centerPosition}px, Grid Line:{" "}
              {pos.gridLinePosition}px
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Artist Position Calculations (Friday)</h3>
        <div className="space-y-2">
          {verifications.map((verification, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded">
              <div className="font-semibold">{verification.artist}</div>
              <div className="text-sm text-gray-300">{verification.time}</div>
              <div className="text-sm">
                <span className="text-green-400">Start Position: {verification.startPosition}px</span> |
                <span className="text-blue-400"> Width: {verification.width}px</span> |
                <span className="text-yellow-400"> Duration: {verification.durationMinutes}min</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Hours from start: {verification.calculation.hoursFromStart} | Minutes into hour:{" "}
                {verification.calculation.minutesIntoHour} | Base position:{" "}
                {verification.calculation.expectedHourPosition}px + Minute offset:{" "}
                {Math.round(verification.calculation.minuteOffset)}px
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Expected Alignments</h3>
        <div className="space-y-1 text-sm">
          <div>• Ronnie Flex (13:40) should start at ~133px (40min into first hour)</div>
          <div>• LaBoely (13:00) should start at 0px (exactly at timeline start)</div>
          <div>• Pommelien Thijs (14:45) should start at ~350px (1 hour + 45min)</div>
          <div>• Warhaus (14:15) should start at ~250px (1 hour + 15min)</div>
          <div>• Alestorm (15:50) should start at ~567px (2 hours + 50min)</div>
        </div>
      </div>
    </div>
  )
}
