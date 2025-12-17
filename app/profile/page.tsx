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

  useEffect(() => {
    loadUser()
  }, [])

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
        // 处理头像URL
        let remoteAvatar = remoteUser.avatarUrl || currentUser.avatar || ""
        if (remoteAvatar.startsWith('/')) {
            const baseUrl = process.env.NEXT_PUBLIC_USER_CENTER_URL || "https://user-center.ravey.site"
            remoteAvatar = baseUrl.replace(/\/$/, '') + remoteAvatar
        }
        setAvatarUrl(remoteAvatar)
      } catch (e) {
        console.error("Failed to fetch remote user info", e)
        // 降级使用本地存储的信息
        setNickname(currentUser.name || "")
        setAvatarUrl(currentUser.avatar || "")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("图片大小不能超过 5MB")
      return
    }

    try {
      setUploading(true)
      // 显示本地预览
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)

      // 上传
      const url = await api.user.uploadAvatar(file)
      setAvatarUrl(url) 
    } catch (error) {
      toast.error("上传失败: " + (error instanceof Error ? error.message : "未知错误"))
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim()) {
      toast.error("请输入昵称")
      return
    }

    try {
      setSaving(true)
      const updatedUser = await api.user.updateProfile({
        nickname,
        avatarUrl
      })
      
      // 更新本地 auth 状态
      const currentUser = authManager.getCurrentUser()
      if (currentUser) {
        // 处理返回的头像URL
        let newAvatar = updatedUser.avatarUrl
        if (newAvatar && newAvatar.startsWith('/')) {
            const baseUrl = process.env.NEXT_PUBLIC_USER_CENTER_URL || "https://user-center.ravey.site"
            newAvatar = baseUrl.replace(/\/$/, '') + newAvatar
        }
        
        authManager.setAuth({
          ...authManager.getAuth()!,
          user: {
            ...currentUser,
            name: updatedUser.nickname,
            avatar: newAvatar
          }
        })
      }
      
      toast.success("保存成功")
      router.push('/')
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
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white/70 hover:text-white hover:bg-white/10">
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
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-24 w-24 border-2 border-white/10">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-white/10 text-white/50 text-2xl">
                    {nickname?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-white/50">点击修改头像</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-white/70">昵称</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/30"
                placeholder="请输入昵称"
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
