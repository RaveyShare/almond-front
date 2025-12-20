"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"

export default function ReviewTools() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-2xl font-bold mb-6">回顾 · 工具</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-white/10 bg-white/5"><CardHeader><CardTitle className="text-cyan-400">思维导图</CardTitle></CardHeader><CardContent className="text-white/70">需要时出现</CardContent></Card>
          <Card className="border border-white/10 bg-white/5"><CardHeader><CardTitle className="text-cyan-400">助记符</CardTitle></CardHeader><CardContent className="text-white/70">需要时出现</CardContent></Card>
          <Card className="border border-white/10 bg-white/5"><CardHeader><CardTitle className="text-cyan-400">感官联想</CardTitle></CardHeader><CardContent className="text-white/70">需要时出现</CardContent></Card>
        </div>
      </main>
    </div>
  )
}
