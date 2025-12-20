"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api-config"
import { authManager } from "@/lib/auth"
import { toast } from "sonner"
import { Loader2, Camera, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [nickname, setNickname] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    loadUser()
    // 清理函数：释放预览 URL
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  // 统一的头像 URL 处理函数
  const normalizeAvatarUrl = (url: string): string => {
    if (!url || !url.startsWith('/')) return url
    const baseUrl = process.env.NEXT_PUBLIC_USER_CENTER_URL || "https://user-center.ravey.site"
    return baseUrl.replace(/\/$/, '') + url
  }

  const loadUser = async () => {
    try {
      const currentUser = authManager.getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      // 尝试从后端获取最新信息
      try {
        const remoteUser = await api.user.getCurrentUser()
        setNickname(remoteUser.nickname || currentUser.name || "")
        setAvatarUrl(normalizeAvatarUrl(remoteUser.avatarUrl || currentUser.avatar || ""))
      } catch (e) {
        console.error("Failed to fetch remote user info", e)
        // 降级使用本地存储的信息
        setNickname(currentUser.name || "")
        setAvatarUrl(normalizeAvatarUrl(currentUser.avatar || ""))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB")
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error("请选择图片文件")
      return
    }

    const previousAvatar = avatarUrl // 保存旧头像用于失败回滚

    try {
      setUploading(true)

      // 清理之前的预览 URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }

      // 创建本地预览
      previewUrlRef.current = URL.createObjectURL(file)
      setAvatarUrl(previewUrlRef.current)

      // 上传到服务器
      const uploadedUrl = await api.user.uploadAvatar(file)
      const normalizedUrl = normalizeAvatarUrl(uploadedUrl)
      setAvatarUrl(normalizedUrl)

      // 上传成功后清理预览 URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }

      toast.success("头像上传成功")
    } catch (error) {
      // 上传失败，恢复原头像
      setAvatarUrl(previousAvatar)
      toast.error("上传失败: " + (error instanceof Error ? error.message : "未知错误"))

      // 清理预览 URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
        previewUrlRef.current = null
      }
    } finally {
      setUploading(false)
      // 重置 input，允许重新选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedNickname = nickname.trim()
    if (!trimmedNickname) {
      toast.error("请输入昵称")
      return
    }

    if (trimmedNickname.length > 20) {
      toast.error("昵称不能超过 20 个字符")
      return
    }

    try {
      setSaving(true)
      const updatedUser = await api.user.updateProfile({
        nickname: trimmedNickname,
        avatarUrl
      })

      // 更新本地 auth 状态
      const currentUser = authManager.getCurrentUser()
      if (currentUser) {
        const normalizedAvatar = normalizeAvatarUrl(updatedUser.avatarUrl)

        authManager.setAuth({
          ...authManager.getAuth()!,
          user: {
            ...currentUser,
            name: updatedUser.nickname,
            avatar: normalizedAvatar
          }
        })
      }

      toast.success("保存成功")
      // 稍微延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error) {
      toast.error("保存失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-xl font-bold text-white">完善个人资料</CardTitle>
              <CardDescription className="text-white/50">完善资料让大家更好地认识你</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <Avatar className="h-24 w-24 border-2 border-white/10">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-white/50 text-2xl">
                    {nickname?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>
              <p className="text-sm text-white/50">
                {uploading ? "上传中..." : "点击修改头像（最大 5MB）"}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-white/70">
                昵称 <span className="text-white/40 text-xs">（最多 20 字符）</span>
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/30"
                placeholder="请输入昵称"
                maxLength={20}
                disabled={saving}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
              disabled={saving || uploading}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}