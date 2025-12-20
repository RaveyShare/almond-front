"use client"
import { useEffect, useState } from "react"
import { getHomeSummary, type HomeSummary } from "@/lib/home-api"

export default function TopOneLiner() {
  const [data, setData] = useState<HomeSummary | null>(null)

  useEffect(() => {
    getHomeSummary().then(setData).catch(() => {
      setData({
        summaryText: "最近有点忙，也没关系，杏仁都在",
        signals: { createdCount7d: 0, activeGoals: 0, recentReviews: 0, busyHint: false },
      })
    })
  }, [])

  return (
    <div className="px-4 py-6 text-center">
      <p className="text-white/90 text-lg">{data?.summaryText || ""}</p>
    </div>
  )
}

