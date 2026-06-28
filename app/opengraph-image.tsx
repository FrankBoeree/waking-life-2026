import { ImageResponse } from "next/og"
import { FESTIVAL_CONFIG, FESTIVAL_OFFICIAL_DATE_RANGE } from "@/lib/festival-config"

export const dynamic = "force-static"

export const alt =
  "Dekmantel Festival 2026 unofficial timetable and lineup"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #f5f0e8 0%, rgba(230,57,70,0.18) 35%, rgba(69,123,157,0.12) 65%, rgba(155,93,229,0.16) 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, color: "#111" }}>
          dekmantel
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, color: "#111" }}>
          festival {FESTIVAL_CONFIG.year}
        </div>
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: "#333", marginTop: 24 }}>
          unofficial timetable
        </div>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#555", marginTop: 16 }}>
          {FESTIVAL_OFFICIAL_DATE_RANGE.toLowerCase()} · amsterdamse bos
        </div>
      </div>
    ),
    { ...size },
  )
}
