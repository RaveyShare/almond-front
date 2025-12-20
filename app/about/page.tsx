"use client"

import Link from "next/link"
import { Brain, ArrowRight, Sparkles, Heart, Compass } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -right-1/4 top-1/2 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        </div>
        <div className="container px-4 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            小杏仁 · 你的 AI 成长伙伴
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            不是催促与评判，而是理解与陪伴。用温柔的方式，帮你一步一步变成想成为的自己。
          </p>
          <div className="mt-6 flex items-center justify-center space-x-3">
            <Link href="/auth/register">
              <Button className="bg-cyan-500 text-black hover:bg-cyan-600">
                开始使用
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 产品世界观区域 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-white">
              小杏仁的世界观
            </h2>
            
            <div className="space-y-12">
              {/* 小杏仁是什么？ */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    小杏仁是什么？
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p className="text-lg">
                  在人的大脑里，有一个区域叫“杏仁核”，它负责情绪、记忆和安全感。
                   </p>
                  <p className="text-lg">
                    小杏仁就是那个——<strong className="text-white">住在你心里的小小守望者。</strong>
                  </p>
                  <p>
                   它不教你变强，而是陪你走过每一次波动与成长
                  </p>
                </CardContent>
              </Card>

              {/* 一切，从一颗「杏仁」开始 */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    一切，从一颗「杏仁」开始
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    <strong className="text-white">杏仁</strong>，是你放进小杏仁里的任何东西：
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>一个突然想到的想法</li>
                    <li>一件需要完成的事情</li>
                    <li>一个想长期坚持的目标</li>
                    <li>一段值得记住的经历</li>
                    <li>一次完成后的复盘</li>
                  </ul>
                  <p>
                    你不需要给它分类，也不需要决定它的用途。
                  </p>
                  <p className="text-lg">
                    你只需要：<strong className="text-white">先放下一颗杏仁。</strong>
                  </p>
                </CardContent>
              </Card>

              {/* 杏仁会慢慢"长大" */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    杏仁会慢慢"长大"
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    当杏仁被放进来，小杏仁会试着理解它：
                  </p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>这是需要记住的吗？</li>
                    <li>这是可以执行的吗？</li>
                    <li>这是一个长期目标吗？</li>
                    <li>这是一次值得复盘的经历吗？</li>
                  </ul>
                  <p>
                    你可以随时确认、修改，也可以什么都不管。
                  </p>
                  <p className="text-lg">
                    <strong className="text-white">杏仁会随着你的生活发生变化。</strong>
                  </p>
                </CardContent>
              </Card>

              {/* 你只负责想，剩下的交给我 */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    你只负责想，剩下的交给我
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    如果一颗杏仁更像是记忆，小杏仁会帮你制定复习节奏，在合适的时候提醒你。
                  </p>
                  <p>
                    如果一颗杏仁更像是行动，它会进入你的日常安排。
                  </p>
                  <p>
                    如果它是一个目标，小杏仁会帮你拆解、关联进度与复盘。
                  </p>
                  <p className="text-lg">
                    你不需要管理系统，<strong className="text-white">系统会慢慢适应你。</strong>
                  </p>
                </CardContent>
              </Card>

              {/* 小杏仁想做的事 */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    小杏仁想做的事
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    这个世界的信息太多，人却越来越难真正思考。
                  </p>
                  <p>
                    小杏仁想做的，不是让你更忙，而是让你<strong className="text-white">更清楚</strong>。
                  </p>
                  <p>
                    清楚你在记什么，在做什么，在为什么而努力。
                  </p>
                </CardContent>
              </Card>

              {/* 这是一颗会陪你一起成长的杏仁 */}
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-cyan-400">
                    这是一颗会陪你一起成长的杏仁
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-white/80">
                  <p>
                    你的人生在变，杏仁的形态也会变。
                  </p>
                  <p>
                    它不是一个一次性工具，而是一个会长期陪伴你的<strong className="text-white">成长伙伴。</strong>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
