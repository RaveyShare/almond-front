"use client"

import Link from "next/link"
import { Brain, ArrowRight, Sparkles, Heart, Compass } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
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
            <Link className="text-sm hover:text-cyan-400" href="/reviews">
              复盘
            </Link>
            <Link className="text-sm hover:text-cyan-400" href="/memory-library">
              记忆库
            </Link>
          </div>
        </div>
      </header>

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
            <Link href="/memory-library" className="text-sm text-white/70 hover:text-cyan-400">
              了解功能
            </Link>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="zh" className="w-full">
          <TabsList className="mb-8 bg-white/5">
            <TabsTrigger value="zh">中文</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="zh">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    我们的愿景与使命
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <p>陪伴每一个人，在成长的每个阶段，成为更完整的自己。</p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>理解自己：看清真实需求与模式</li>
                    <li>整理自己：理清思绪，找到方向</li>
                    <li>行动于自己：不是只想，而是真的做到</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-cyan-400" />
                    小杏仁能为你做什么
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <ul className="list-disc space-y-2 pl-6">
                    <li>建立三维记忆系统，让重要内容真正“记住”</li>
                    <li>陪你做计划与复盘，找到适合你的节奏</li>
                    <li>运用思维模型，帮你把问题想清楚</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-cyan-400" />
                    我们的原则
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-white/80">
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">温柔优先</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">陪伴而非指导</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">理解而非评判</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">渐进而非激进</div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>联系与更多</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <p>
                    官网：
                    <Link href="https://almond.ai" className="text-cyan-400">almond.ai</Link>
                  </p>
                  <p>邮箱：<span className="text-cyan-400">hello@almond.ai</span></p>
                  <div className="flex gap-3">
                    <Link href="/privacy">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        隐私政策
                      </Button>
                    </Link>
                    <Link href="/terms">
                      <Button variant="outline" className="border-white/20 text-white hover:bg白/10">
                        使用条款
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="en">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    Vision & Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <p>Accompany everyone to become a more whole self at every stage of growth.</p>
                  <ul className="list-disc space-y-2 pl-6">
                    <li>Understand yourself: see true needs and patterns</li>
                    <li>Organize yourself: untangle thoughts and find direction</li>
                    <li>Act for yourself: follow through beyond intention</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg白/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-cyan-400" />
                    What Almond Does
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <ul className="list-disc space-y-2 pl-6">
                    <li>Build a 3D memory system for truly remembered content</li>
                    <li>Plan and review with you to find your rhythm</li>
                    <li>Use thinking models to help you think clearly</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg白/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Principles</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-white/80">
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">Gentleness first</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">Companionship over instruction</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">Understanding over judgment</div>
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3">Incremental over radical</div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg白/5 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-white/80">
                  <p>
                    Website:
                    <Link href="https://almond.ai" className="text-cyan-400">almond.ai</Link>
                  </p>
                  <p>Email: <span className="text-cyan-400">hello@almond.ai</span></p>
                  <div className="flex gap-3">
                    <Link href="/privacy">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Privacy
                      </Button>
                    </Link>
                    <Link href="/terms">
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Terms
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
