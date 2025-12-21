"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Share2, Eye, Brain, Calendar, Tag } from "lucide-react"
import type { AlmondItem } from "@/lib/types"

interface AlmondCardDetailProps {
  item: AlmondItem
  isOpen: boolean
  onClose: () => void
  onShare?: (type: string, content: any) => void
}

export function AlmondCardDetail({ item, isOpen, onClose, onShare }: AlmondCardDetailProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // 鼠标跟随旋转效果
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / 12
    const rotateY = (centerX - x) / 12
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
    setIsHovered(false)
  }

  // 根据类型获取颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memory': return 'from-blue-500 to-blue-600'
      case 'task': return 'from-green-500 to-green-600'
      case 'goal': return 'from-orange-500 to-orange-600'
      default: return 'from-purple-500 to-purple-600'
    }
  }

  // 获取状态文本
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      'new': '🌱 新杏仁',
      'understood': '👀 被理解',
      'evolving': '🔄 演化中',
      'memorizing': '🧠 记忆',
      'acting': '✅ 行动',
      'targeting': '🎯 目标',
      'reviewing_cycle': '🔁 复习',
      'completed': '✔ 完成',
      'promoting': '📈 推进',
      'reflecting': '🪞 复盘',
      'precipitating': '🌰 沉淀',
      'archived': '🌰 归档',
      'todo': '待办',
      'doing': '进行中',
      'done': '已完成',
      'reviewing': '复习中',
      'mastered': '已掌握'
    }
    return statusMap[status] || '未知状态'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* 卡片容器 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            {/* 3D卡片 */}
            <div
              ref={cardRef}
              className={`relative w-full max-w-2xl rounded-2xl bg-gradient-to-br ${getTypeColor(item.almondType)} p-8 shadow-2xl`}
              style={{
                transformStyle: "preserve-3d",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.3)"
              }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* 头部信息 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-white/20">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{item.title || '杏仁'}</h2>
                    <p className="text-white/80">{getStatusText(item.status)}</p>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  {onShare && (
                    <button
                      onClick={() => onShare('almond', item)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`/memory-item/${item.id}`, '_blank')}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="space-y-6">
                {/* 主要内容 */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-3">内容</h3>
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>

                {/* 元信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 创建时间 */}
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-white/70" />
                      <span className="text-white/70 text-sm">创建时间</span>
                    </div>
                    <p className="text-white font-medium">
                      {new Date(item.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>

                  {/* 标签 */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-white/70" />
                        <span className="text-white/70 text-sm">标签</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/20 rounded-full text-white text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 分类 */}
                  {item.category && (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-white/70" />
                        <span className="text-white/70 text-sm">分类</span>
                      </div>
                      <p className="text-white font-medium capitalize">
                        {item.category}
                      </p>
                    </div>
                  )}

                  {/* 优先级 */}
                  {item.priority !== undefined && (
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                        <span className="text-white/70 text-sm">优先级</span>
                      </div>
                      <p className="text-white font-medium">
                        {item.priority}/10
                      </p>
                    </div>
                  )}
                </div>

                {/* 状态机进度 */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4">成长轨迹</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" />
                      <span className="text-white/80">当前状态</span>
                    </div>
                    <span className="text-white font-medium">
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(item.status)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 获取状态进度百分比
function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    'new': 10,
    'understood': 25,
    'evolving': 40,
    'memorizing': 55,
    'acting': 55,
    'targeting': 55,
    'reviewing_cycle': 70,
    'completed': 85,
    'promoting': 85,
    'reflecting': 95,
    'precipitating': 100,
    'archived': 100,
    'todo': 20,
    'doing': 50,
    'done': 80,
    'reviewing': 60,
    'mastered': 90
  }
  return progressMap[status] || 0
}