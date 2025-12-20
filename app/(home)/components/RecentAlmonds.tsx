"use client"
import { useEffect, useState } from "react"
import { getHomeRecent, type RecentItem } from "@/lib/home-api"
import { Card, CardContent } from "@/components/ui/card"

export default function RecentAlmonds() {
  const [items, setItems] = useState<RecentItem[]>([])
  useEffect(() => {
    getHomeRecent(5).then((r) => setItems(r.items)).catch(() => setItems([]))
  }, [])
  return (
    <div className="px-4">
      <Card className="border border-white/20 bg-white/5">
        <CardContent className="p-4 space-y-2">
          {items.map((i) => (
            <div key={i.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="font-medium text-white">{i.title}</div>
              <div className="text-sm text-white/70">{i.excerpt || ""}</div>
            </div>
          ))}
          {items.length === 0 && <div className="text-sm text-white/50 text-center py-4">暂无最近的杏仁</div>}
        </CardContent>
      </Card>
    </div>
  )
}

