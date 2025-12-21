"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import type { AlmondItem } from "@/lib/types"

interface Almond3DCardProps {
  item: AlmondItem
  position: [number, number, number]
  onClick: (item: AlmondItem) => void
  isHovered: boolean
  onHover: (hovered: boolean) => void
}

function FloatingAlmondCard({ item, position, onClick, isHovered, onHover }: Almond3DCardProps) {
  const meshRef = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(1)

  // 始终面向相机
  useFrame(({ camera }) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
      // 悬停时的缩放动画
      const targetScale = isHovered ? 1.15 : 1
      setScale(THREE.MathUtils.lerp(scale, targetScale, 0.1))
      meshRef.current.scale.setScalar(scale)
    }
  })

  // 根据杏仁类型确定颜色
  const getCardColor = (type: string) => {
    switch (type) {
      case 'memory':
        return '#3B82F6' // 蓝色 - 记忆
      case 'task':
        return '#10B981' // 绿色 - 任务
      case 'goal':
        return '#F59E0B' // 橙色 - 目标
      default:
        return '#8B5CF6' // 紫色 - 通用杏仁
    }
  }

  const cardColor = getCardColor(item.almondType)
  const statusText = getStateMachineStatusText(item.status)

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={() => onClick(item)}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* 卡片背景 */}
      <mesh>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial
          color={cardColor}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 边框 */}
      <mesh>
        <planeGeometry args={[3.1, 4.1]} />
        <meshStandardMaterial
          color={isHovered ? '#FFFFFF' : cardColor}
          transparent
          opacity={isHovered ? 0.5 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 标题文字 */}
      <Text
        position={[0, 1.2, 0.01]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        textAlign="center"
      >
        {item.title || item.content.substring(0, 20)}
      </Text>

      {/* 状态文字 */}
      <Text
        position={[0, 0.8, 0.01]}
        fontSize={0.15}
        color={isHovered ? '#FFFFFF' : '#E5E7EB'}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        textAlign="center"
      >
        {statusText}
      </Text>

      {/* 内容预览 */}
      <Text
        position={[0, 0.2, 0.01]}
        fontSize={0.12}
        color="#D1D5DB"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.5}
        textAlign="center"
        maxLines={3}
      >
        {item.content.substring(0, 50)}...
      </Text>

      {/* 类型图标 */}
      <mesh position={[0, -1.2, 0.01]}>
        <circleGeometry args={[0.3]} />
        <meshStandardMaterial
          color={cardColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      <Text
        position={[0, -1.2, 0.02]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {getTypeEmoji(item.almondType)}
      </Text>
    </group>
  )
}

// 辅助函数：获取状态机状态文本
function getStateMachineStatusText(status: string): string {
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

// 辅助函数：获取类型emoji
function getTypeEmoji(type: string): string {
  const emojiMap: Record<string, string> = {
    'memory': '🧠',
    'task': '📋',
    'goal': '🎯',
    'almond': '🌰'
  }
  return emojiMap[type] || '🌰'
}

interface Almond3DCardGalleryProps {
  items: AlmondItem[]
  onCardClick: (item: AlmondItem) => void
}

export function Almond3DCardGallery({ items, onCardClick }: Almond3DCardGalleryProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  // 使用斐波那契球体算法生成卡片位置
  const cardPositions = items.map((_, index) => {
    const numCards = items.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    
    const y = 1 - (index / (numCards - 1)) * 2
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = (2 * Math.PI * index) / goldenRatio
    
    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY
    
    // 多层半径设计
    const layerRadius = 8 + (index % 3) * 3
    
    return [x * layerRadius, y * layerRadius, z * layerRadius] as [number, number, number]
  })

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        className="absolute inset-0"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <Environment preset="city" />
        
        {items.map((item, index) => (
          <FloatingAlmondCard
            key={item.id}
            item={item}
            position={cardPositions[index]}
            onClick={onCardClick}
            isHovered={hoveredCard === item.id}
            onHover={(hovered) => setHoveredCard(hovered ? item.id : null)}
          />
        ))}
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={40}
          autoRotate={true}
          rotateSpeed={0.5}
          zoomSpeed={1.2}
          panSpeed={0.8}
        />
      </Canvas>
      
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 pointer-events-none" />
      
      {/* 标题 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-3xl font-bold text-white mb-2">杏仁星系</h2>
        <p className="text-white/70">点击卡片查看详情，拖拽旋转视角</p>
      </div>
    </div>
  )
}