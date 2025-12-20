"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Brain, Plus, Calendar, Target, Flag, ListTodo, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import AuthGuard from "@/components/auth/auth-guard"
import { api } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"
import { SiteHeader } from "@/components/site-header"

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState("year")
  const [plans, setPlans] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPlans(activeTab)
  }, [activeTab])

  const loadPlans = async (level: string) => {
    setIsLoading(true)
    try {
      const data = await api.getPlans(level)
      setPlans(data)
    } catch (error) {
      console.error("Failed to load plans:", error)
      toast({
        title: "加载失败",
        description: "无法获取计划数据，请稍后重试",
        variant: "destructive",
        open: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" /></div>}>
      <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />

        <main className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 rounded-full p-2 hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">成长计划</h1>
                <p className="text-sm text-white/50">规划你的成长路径，步步为营</p>
              </div>
            </div>
            <Button className="bg-cyan-400 text-black hover:bg-cyan-500">
              <Plus className="mr-2 h-4 w-4" />
              新建计划
            </Button>
          </div>

          <Tabs defaultValue="year" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 w-full justify-start border-b border-white/10 bg-transparent p-0">
              <TabsTrigger
                value="year"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                年度计划
              </TabsTrigger>
              <TabsTrigger
                value="quarter"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                季度计划
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                月度计划
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                周计划
              </TabsTrigger>
              <TabsTrigger
                value="day"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-cyan-400 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400"
              >
                每日待办
              </TabsTrigger>
            </TabsList>

            <TabsContent value="year" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                </div>
              ) : plans.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((plan) => (
                    <Card key={plan.id} className="border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-medium text-white">{plan.title}</CardTitle>
                          {plan.status === 'done' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : (
                            <Circle className="h-5 w-5 text-white/30" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-white/50">
                            <span>进度</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-2 bg-white/10" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                 <EmptyState type="year" />
              )}
            </TabsContent>
            <TabsContent value="quarter" className="space-y-4">
                <EmptyState type="quarter" />
            </TabsContent>
            <TabsContent value="month" className="space-y-4">
                <EmptyState type="month" />
            </TabsContent>
            <TabsContent value="week" className="space-y-4">
                <EmptyState type="week" />
            </TabsContent>
             <TabsContent value="day" className="space-y-4">
                <EmptyState type="day" />
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
        year: "年度宏图",
        quarter: "季度目标",
        month: "月度重点",
        week: "周度冲刺",
        day: "今日要事"
    }
    const icons: Record<string, any> = {
        year: Flag,
        quarter: Target,
        month: Calendar,
        week: ListTodo,
        day: ListTodo
    }
    const Icon = icons[type] || Flag

  return (
    <Card className="col-span-full border border-dashed border-white/20 bg-white/5 p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-white/10 p-4">
          <Icon className="h-8 w-8 text-cyan-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">暂无{titles[type]}</h3>
          <p className="text-white/50">开始制定你的{titles[type]}，迈出成长的第一步。</p>
        </div>
        <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
          <Plus className="mr-2 h-4 w-4" />
          创建计划
        </Button>
      </div>
    </Card>
  )
}
