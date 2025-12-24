"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Brain, Plus, Calendar, RotateCw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AuthGuard from "@/components/auth/auth-guard"

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("week")

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>}>
      <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-black text-white">
        <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between px-4">
            <Link className="flex items-center space-x-2 font-bold" href="/">
              <Brain className="h-6 w-6 text-cyan-400" />
              <span>小杏仁</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link className="text-sm hover:text-cyan-400" href="/plans">
                计划
              </Link>
              <Link className="text-sm text-cyan-400" href="/reviews">
                复盘
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/memory-library">
                记忆库
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 rounded-full p-2 hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">成长复盘</h1>
                <p className="text-sm text-white/50">定期回顾，总结经验，持续进化</p>
              </div>
            </div>
            <Button className="bg-cyan-400 text-black hover:bg-cyan-500">
              <Plus className="mr-2 h-4 w-4" />
              开始复盘
            </Button>
          </div>

          <Tabs defaultValue="week" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 w-full justify-start border-b border-white/10 bg-transparent p-0">
              <TabsTrigger
                value="week"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                周度复盘
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                月度复盘
              </TabsTrigger>
              <TabsTrigger
                value="quarter"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                季度复盘
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                年度复盘
              </TabsTrigger>
            </TabsList>

            <TabsContent value="week" className="space-y-4">
               <EmptyState type="week" />
            </TabsContent>
            <TabsContent value="month" className="space-y-4">
                <EmptyState type="month" />
            </TabsContent>
            <TabsContent value="quarter" className="space-y-4">
                <EmptyState type="quarter" />
            </TabsContent>
            <TabsContent value="year" className="space-y-4">
                <EmptyState type="year" />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      </AuthGuard>
    </Suspense>
  )
}

function EmptyState({ type }: { type: string }) {
    const titles: Record<string, string> = {
        year: "年度总结",
        quarter: "季度回顾",
        month: "月度反思",
        week: "周度复盘"
    }
    const icons: Record<string, any> = {
        year: Trophy,
        quarter: Calendar,
        month: Calendar,
        week: RotateCw
    }
    const Icon = icons[type] || RotateCw

  return (
    <Card className="col-span-full border border-dashed border-white/20 bg-white/5 p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-white/10 p-4">
          <Icon className="h-8 w-8 text-cyan-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">暂无{titles[type]}</h3>
          <p className="text-white/50">开启你的{titles[type]}，沉淀成长的智慧。</p>
        </div>
        <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
          <Plus className="mr-2 h-4 w-4" />
          写复盘
        </Button>
      </div>
    </Card>
  )
}
