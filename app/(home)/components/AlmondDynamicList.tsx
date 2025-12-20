"use client"
import { useEffect, useState } from "react"
import { getHomeDynamic, type HomeDynamicItem } from "@/lib/home-api"
import { Card, CardContent } from "@/components/ui/card"

function ItemCard({ item }: { item: HomeDynamicItem }) {
  const subtitle =
    item.cardType === "growing"
      ? "这颗杏仁最近被你反复想起"
      : item.cardType === "review"
      ? "要不要快速看一眼这颗杏仁？"
      : item.cardType === "near-done"
      ? "这颗杏仁已经接近完成"
      : "这个目标最近有进展"
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="font-medium text-white">{item.title}</div>
      <div className="text-sm text-white/70">{subtitle}</div>
    </div>
  )
}

export default function AlmondDynamicList() {
  const [items, setItems] = useState<HomeDynamicItem[]>([])
  useEffect(() => {
    getHomeDynamic(5).then((r) => setItems(r.items)).catch(() => setItems([]))
  }, [])
  return (
    <div className="px-4">
      <Card className="border border-white/20 bg-white/5">
        <CardContent className="p-4 space-y-2">
          {items.slice(0, 5).map((i) => (
            <ItemCard key={i.id} item={i} />
          ))}
          {items.length === 0 && <div className="text-sm text-white/50 text-center py-4">正在成长 🌱</div>}
        </CardContent>
      </Card>
    </div>
  )
}

