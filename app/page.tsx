"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Mic, Loader2, Calendar, ArrowRight, Eye, Share2, ListTodo } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api-config"
import { toast } from "sonner"
import { authManager } from "@/lib/auth"
import MemoryAidsViewer from "@/components/MemoryAidsViewer"
import ShareDialog from "@/components/share-dialog"
import DecomposeModal from "@/components/decompose-modal"
import LoadingSpinner from "@/components/loading-spinner"
import MissionVision from "@/components/mission-vision"
import { formatInLocalTimezone } from "@/lib/date"
import type { MemoryAids, AlmondItem } from "@/lib/types"
import { SiteHeader } from "@/components/site-header"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 扩展 dayjs 插件
dayjs.extend(utc)
dayjs.extend(timezone)

const PLACEHOLDERS = [
  "「刚想到的一件事」",
  "「一个模糊的想法」",
  "「最近反复出现的念头」",
  "「今天发生的一件事」"
]

export default function Home() {
  const [inputValue, setInputValue] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  const [almondItems, setAlmondItems] = useState<AlmondItem[]>([])
  const [loadingAlmondItems, setLoadingAlmondItems] = useState(false)

  // Generated content states
  const [generatedContent, setGeneratedContent] = useState<string>("")
  const [generatedAids, setGeneratedAids] = useState<MemoryAids | null>(null)
  const [showGeneratedContent, setShowGeneratedContent] = useState(false)

  // Share dialog states
  const [shareType, setShareType] = useState<string | null>(null)
  const [shareContent, setShareContent] = useState<any>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // Decompose modal states
  const [decomposeModalOpen, setDecomposeModalOpen] = useState(false)
  const [selectedTaskForDecompose, setSelectedTaskForDecompose] = useState<{ id: string, title: string } | null>(null)

  // Success dialog states
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [isFirstAlmond, setIsFirstAlmond] = useState(false)

  const router = useRouter()


  useEffect(() => {
    setIsAuthenticated(authManager.isAuthenticated())

    const unsubscribe = authManager.addListener(() => {
      setIsAuthenticated(authManager.isAuthenticated())
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadAlmondItems()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadAlmondItems = async () => {
    try {
      setLoadingAlmondItems(true)
      const items = await api.getMemoryItems()
      // 临时转换函数，后续需要API层统一返回AlmondItem格式
      const almondItems = items.map((item: any) => ({
        ...item,
        almondType: item.type === 'task' ? 'task' : 'memory',
        itemType: 'general',
        level: 'inbox',
        updated_at: item.created_at
      }))
      setAlmondItems(almondItems.slice(0, 5))
    } catch (error) {
      console.error("Failed to load almond items:", error)
      const errorMessage = error instanceof Error ? error.message : ''

      if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
        toast("网络连接较慢", {
          description: "正在努力为您加载最近的杏仁内容，请稍等片刻...",
        })
      } else {
        toast("内容加载中", {
          description: "杏仁内容正在加载，请稍后刷新页面查看",
        })
      }
    } finally {
      setLoadingAlmondItems(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !isAuthenticated) return

    setIsLoading(true)
    setShowGeneratedContent(false)
    const contentToSave = inputValue
    setInputValue("") // 为了更好的用户体验，立即清空输入框

    try {
      // 检查是否是第一颗杏仁 (在保存前检查列表是否为空)
      const isFirst = almondItems.length === 0
      
      // 统一杏仁创建逻辑 - 默认创建为almond类型，让AI后续处理
      const savedItem = await api.saveMemoryItem({ 
        content: contentToSave, 
        memory_aids: { 
          mindMap: { id: "", label: "", children: [] }, 
          mnemonics: [], 
          sensoryAssociations: [] 
        } 
      })

      // 显示成功对话框
      setIsFirstAlmond(isFirst)
      setSuccessDialogOpen(true)

      // 使用新项目乐观地更新UI
      const almondItem: AlmondItem = {
        ...savedItem,
        almondType: 'almond',
        itemType: 'general',
        level: 'inbox',
        updated_at: savedItem.created_at,
        priority: savedItem.priority || 0
      }
      
      setAlmondItems((prev) => [almondItem, ...prev.slice(0, 4)])
      setIsLoading(false); // 停止主要的加载动画

      // 在后台生成辅助工具
      (async () => {
        try {
          const memoryAids = await api.generateMemoryAids(savedItem.content)

          // 当AI内容准备好后，显示生成的内容部分
          setGeneratedContent(savedItem.content)
          setGeneratedAids(memoryAids)
          setShowGeneratedContent(true)

          const updatedItem = await api.updateMemoryItemAids(savedItem.id, memoryAids)

          // 使用完整数据（包括辅助工具）更新列表中的特定项目
          const updatedAlmondItem: AlmondItem = {
            ...updatedItem,
            almondType: 'almond',
            itemType: 'general', 
            level: 'inbox',
            updated_at: updatedItem.created_at,
            priority: updatedItem.priority || 0
          }
          
          setAlmondItems(prev => prev.map(item => item.id === updatedAlmondItem.id ? updatedAlmondItem : item))

          toast("杏仁已成长", {
            description: `"${savedItem.content.substring(0, 20)}..."的辅助工具已就绪。`,
          });
        } catch (error) {
          console.error("Error generating memory aids in background:", error);
          const errorMessage = error instanceof Error ? error.message : ''

          // 根据错误类型显示不同的友好提示
          if (errorMessage.includes('超时') || errorMessage.includes('timeout')) {
            toast("杏仁正在成长", {
              description: "AI 正在为你生成内容，由于内容较复杂需要更多时间，请稍后回来查看完整内容。",
            })
          } else {
            toast("杏仁辅助生成中", {
              description: "AI 正在后台为你生成辅助工具，请稍后刷新页面查看完整内容。",
            })
          }
        }
      })();
    } catch (error) {
      console.error("Error saving item:", error)
      setInputValue(contentToSave) // 恢复输入框内容
      setIsLoading(false)
      const errorMessage = error instanceof Error ? error.message : ''

      toast("种植失败", {
        description: errorMessage || "请稍后重试",
      })
    }
  }

  const handleAlmondItemClick = (item: AlmondItem) => {
    if (item.almondType === 'memory' || item.almondType === 'almond') {
      router.push(`/memory-item/${item.id}`)
    } else {
      // 任务类型，打开拆解弹窗
      setSelectedTaskForDecompose({ id: item.id, title: item.title || item.content })
      setDecomposeModalOpen(true)
    }
  }

  const handleShare = (type: string, content: any) => {
    setShareType(type)
    setShareContent(content)
    setShareDialogOpen(true)
  }

  const handleViewMemoryAids = () => {
    // 创建一个临时的记忆项目并跳转到记忆库
    router.push("/memory-library")
  }

  const getRelativeTimeText = (reviewDate?: string | null): string => {
    if (!reviewDate) {
      return "无计划";
    }

    // 使用 dayjs 处理 UTC 日期时间
    const userTimezone = dayjs.tz.guess();
    const now = dayjs();
    const reviewTime = dayjs.utc(reviewDate).tz(userTimezone);

    // 计算时间差（毫秒）
    const diffMillis = reviewTime.diff(now);

    if (diffMillis <= 0) {
      return "已到期";
    }

    // 计算时间差（秒、分钟、小时、天）
    const diffSeconds = Math.floor(diffMillis / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}天 ${diffHours % 24}小时后`;
    }
    if (diffHours > 0) {
      return `${diffHours}小时 ${diffMinutes % 60}分钟后`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes}分钟后`;
    }
    return "即将开始";
  };

  

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 z-[1]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute -right-1/4 top-1/2 h-96 w-96 rounded-full bg-violet-500/30 blur-3xl"
          />
        </div>

        <div className="container relative z-[3] px-4 text-center">
          <motion.div
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 1}}
              className="mx-auto max-w-3xl space-y-8"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-cyan-400"/>
              小杏仁 - AI成长伙伴
            </h1>
            <p className="mx-auto max-w-2xl text-white/80 sm:text-xl">👋 欢迎来到小杏仁，这里不是任务清单，也不是笔记本
            </p>
            <p className="mx-auto max-w-2xl text-white/80 sm:text-xl">想到什么，先放一颗杏仁
            </p>
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
                className="mx-auto mt-8 max-w-2xl"
            >
              <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="h-14 rounded-full border-white/20 bg-white/10 px-6 text-white placeholder:text-transparent pr-14 text-lg"
                      disabled={isLoading || !isAuthenticated}
                  />
                  {!inputValue && (
                    <div className="absolute inset-0 flex items-center px-6 pointer-events-none overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={placeholderIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="w-full text-white/50 text-lg truncate"
                        >
                          {PLACEHOLDERS[placeholderIndex]}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                  <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full text-white hover:bg-white/10"
                      type="button"
                  >
                    <Mic className="h-5 w-5"/>
                  </Button>
                </div>
                <Button
                    type="submit"
                    size="icon"
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:from-cyan-500 hover:to-violet-600"
                    disabled={isLoading || !isAuthenticated}
                >
                  {isLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin"/>
                  ) : (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                  )}
                </Button>
              </form>
              {!isAuthenticated && (
                  <p className="mt-2 text-sm text-white/50">
                    请 <Link href="/auth/login" className="underline hover:text-cyan-400">登录</Link> 后使用
                  </p>
              )}
            </motion.div>

            <AnimatePresence>
              {isLoading && (
                  <motion.div
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -20}}
                      transition={{duration: 0.5}}
                      className="mx-auto mt-8 max-w-2xl"
                  >
                    <LoadingSpinner message="AI 正在生成杏仁辅助工具..."/>
                  </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showGeneratedContent && !isLoading && generatedAids && (
                  <motion.div
                      initial={{opacity: 0, y: 20}}
                      animate={{opacity: 1, y: 0}}
                      exit={{opacity: 0, y: -20}}
                      transition={{duration: 0.5}}
                      className="mx-auto mt-8 max-w-4xl"
                  >
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl text-cyan-400">生成的杏仁辅助工具</CardTitle>
                          <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 bg-transparent"
                                onClick={handleViewMemoryAids}
                            >
                              <Eye className="mr-2 h-4 w-4"/>
                              详细查看
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-violet-400 text-violet-400 hover:bg-violet-400/10 bg-transparent"
                                onClick={() => handleShare("mindmap", {
                                  title: "记忆辅助工具",
                                  data: generatedAids.mindMap
                                })}
                            >
                              <Share2 className="mr-2 h-4 w-4"/>
                              分享
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-6 rounded-lg border border-white/10 bg-black/50 p-4">
                          <h3 className="mb-2 text-sm font-medium text-white/70">原始内容</h3>
                          <p className="text-white">{generatedContent}</p>
                        </div>

                        <MemoryAidsViewer aids={generatedAids} onShare={handleShare}/>
                      </CardContent>
                    </Card>
                  </motion.div>
              )}
            </AnimatePresence>




            {isAuthenticated && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.8, delay: 0.4}}
                    className="mx-auto mt-12 max-w-2xl"
                >
                  <Card className="border border-white/20 bg-white/5 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-medium text-white">最近杏仁</h3>
                        <Link
                            href="/memory-library"
                            className="flex items-center text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          查看全部
                          <ArrowRight className="ml-1 h-3 w-3"/>
                        </Link>
                      </div>

                      {loadingAlmondItems ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-cyan-400"/>
                          </div>
                      ) : almondItems.length > 0 ? (
                          <div className="space-y-3">
                            {almondItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.5, delay: index * 0.1}}
                                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors cursor-pointer"
                                    onClick={() => handleAlmondItemClick(item)}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        {item.almondType === 'task' && (
                                            <div className="rounded-full border border-white/30 p-1">
                                              <ListTodo className="h-3 w-3 text-cyan-400"/>
                                            </div>
                                        )}
                                        {item.almondType === 'memory' && (
                                            <div className="rounded-full border border-white/30 p-1">
                                              <Brain className="h-3 w-3 text-cyan-400"/>
                                            </div>
                                        )}
                                        {item.almondType === 'almond' && (
                                            <div className="rounded-full border border-white/30 p-1">
                                              <Brain className="h-3 w-3 text-cyan-400"/>
                                            </div>
                                        )}
                                        <h4 className={`font-medium text-white ${item.status === 'done' ? 'line-through text-white/50' : ''}`}>{item.content.substring(0, 20)}...</h4>
                                        {/* Add starred logic if needed */}
                                      </div>
                                      {/* Add category logic if needed */}
                                    </div>
                                    <p className="text-sm text-white/70 line-clamp-1 mt-1">{item.content}</p>
                                    <div className="mt-2 flex items-center justify-between text-white/70 text-xs">
                                      {item.almondType === 'memory' || item.next_review_date ? (
                                          <>
                                            <div className="flex items-center text-cyan-400">
                                              <Calendar className="mr-1.5 h-3 w-3"/>
                                              <span>{item.next_review_date ? formatInLocalTimezone(item.next_review_date, "YYYY-MM-DD HH:mm") : "无计划"}</span>
                                            </div>
                                            <p className="text-white/50">{getRelativeTimeText(item.next_review_date)}</p>
                                          </>
                                      ) : item.almondType === 'task' ? (
                                          <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center space-x-2 text-cyan-400">
                                              <span className="bg-white/10 px-2 py-0.5 rounded text-xs">待办</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-white/5"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleAlmondItemClick(item);
                                                }}
                                            >
                                              <Brain className="h-3.5 w-3.5 mr-1"/>
                                              <span className="text-xs">AI 拆解</span>
                                            </Button>
                                          </div>
                                      ) : (
                                          <div className="flex items-center space-x-2 text-cyan-400">
                                            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">杏仁</span>
                                            <p className="text-white/50">等待AI分析</p>
                                          </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                            ))}
                          </div>
                      ) : (
                          <div className="py-8 text-center">
                            <Brain className="mx-auto mb-2 h-8 w-8 text-white/30"/>
                            <p className="text-sm text-white/50">还没有杏仁</p>
                            <p className="text-xs text-white/30">开始种下你的第一颗杏仁吧</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <MissionVision/>

      <footer className="border-t border-white/10 py-8">
        <div className="container flex flex-col items-center justify-between space-y-4 px-4 md:flex-row md:space-y-0">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-cyan-400" />
            <span className="font-bold">小杏仁</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <p className="text-sm text-white/70">© {new Date().getFullYear()} 小杏仁. 保留所有权利.</p>
            <p className="text-xs text-white/50">
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                浙ICP备2024091992号-3
              </a>
            </p>
          </div>
          <div className="flex space-x-6">
            <Link className="text-sm text-white/70 hover:text-cyan-400" href="/privacy">
              隐私政策
            </Link>
            <Link className="text-sm text-white/70 hover:text-cyan-400" href="/terms">
              使用条款
            </Link>
          </div>
        </div>
      </footer>

      <ShareDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} type={shareType} content={shareContent} />

      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md bg-black/90 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              {isFirstAlmond ? (
                <>
                  <span className="text-2xl">🌱</span> 你已经放下了第一颗杏仁
                </>
              ) : (
                <>
                  <span className="text-2xl">🌰</span> 我记住了这颗杏仁
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-white/80 space-y-4">
            {isFirstAlmond ? (
              <div className="space-y-4">
                <p>
                  以后，每当你不知道<br />
                  「该不该记」「怎么做」「怎么想」
                </p>
                <p>都可以先放进来。</p>
                <p>我会慢慢帮你理清。</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p>它现在还不需要被定义。</p>
                <p>等你准备好，我们可以一起看看：</p>
                <ul className="list-disc pl-5 space-y-2 text-white/70">
                  <li>要不要把它变成一个待办？</li>
                  <li>还是一段需要记住的内容？</li>
                  <li>或者，它其实是一个目标？</li>
                </ul>
                <p className="pt-2">你随时可以回来找我。</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-gradient-to-r from-cyan-400 to-violet-500 text-black hover:from-cyan-500 hover:to-violet-600"
              onClick={() => setSuccessDialogOpen(false)}
            >
              我知道了
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTaskForDecompose && (
        <DecomposeModal
          open={decomposeModalOpen}
          onOpenChange={setDecomposeModalOpen}
          taskId={selectedTaskForDecompose.id}
          taskTitle={selectedTaskForDecompose.title}
        />
      )}
    </div>
  )
}
