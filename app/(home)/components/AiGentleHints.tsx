"use client"
import { useEffect, useState } from "react"
import { getHomeHints, dismissHint, type Hint } from "@/lib/home-api"
import { Button } from "@/components/ui/button"

export default function AiGentleHints() {
  const [hints, setHints] = useState<Hint[]>([])
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    getHomeHints().then((r) => setHints(r.hints)).catch(() => setHints([]))
  }, [])

  const onDismiss = async (id: string) => {
    await dismissHint(id).catch(() => {})
    setHints((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="px-4">
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-white/80">
        <div className="flex items-center justify-between">
          <span className="text-sm">AI 轻提示（可忽略）</span>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed((v) => !v)} className="text-white/60">
            {collapsed ? "展开" : "收起"}
          </Button>
        </div>
        {!collapsed && (
          <div className="mt-3 space-y-2">
            {hints.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded border border-white/10 p-2">
                <span className="text-sm text-white/80">{h.text}</span>
                <Button variant="ghost" size="sm" onClick={() => onDismiss(h.id)} className="text-white/60">
                  关闭
                </Button>
              </div>
            ))}
            {hints.length === 0 && <div className="text-sm text-white/50">暂无提示</div>}
          </div>
        )}
      </div>
    </div>
  )
}

