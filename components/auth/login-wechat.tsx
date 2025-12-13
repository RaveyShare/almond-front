"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, QrCode } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-config"

export default function LoginWechat() {
  const [isWechatLoading, setIsWechatLoading] = useState(false)
  const [wxacodeBase64, setWxacodeBase64] = useState<string>("")
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const wechatLoginInProgress = useRef(false)

  useEffect(() => {
    setIsClient(true)
    handleWechatLogin()
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [])

  const handleWechatLogin = async () => {
    if (isWechatLoading || wechatLoginInProgress.current) return
    try {
      setIsWechatLoading(true)
      wechatLoginInProgress.current = true
      if (pollingInterval) { clearInterval(pollingInterval); setPollingInterval(null) }
      const { qrcodeId } = await api.frontAuth.generateQr("wxe6d828ae0245ab9c")
      const cacheKey = `wxacode_${qrcodeId}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        setWxacodeBase64(cached)
      } else {
        const env = (process.env.NEXT_PUBLIC_WXA_ENV || "trial") as "release" | "trial" | "develop"
        const wxacode = await api.frontAuth.generateWxacode("wxe6d828ae0245ab9c", qrcodeId, "pages/auth/login/login", 430, env as any)
        setWxacodeBase64(wxacode.imageBase64)
        sessionStorage.setItem(cacheKey, wxacode.imageBase64)
      }
      const interval = setInterval(async () => {
        try {
          const { authManager } = await import("@/lib/auth")
          if (authManager.isAuthenticated()) {
            clearInterval(interval)
            setPollingInterval(null)
            return
          }
          const res = await api.frontAuth.checkQr(qrcodeId)
          if (res.status === 2 && res.token) {
            clearInterval(interval)
            setPollingInterval(null)
            const user = {
              id: String(res.userInfo?.id || ""),
              email: "",
              name: res.userInfo?.nickname || "用户",
              avatar: res.userInfo?.avatarUrl,
              createdAt: new Date().toISOString(),
            }
            const authData = { user, token: res.token, refreshToken: "" }
            authManager.setAuth(authData)
            toast({ title: "登录成功", description: `欢迎回来，${user.name}！` })
            const redirectTo = new URLSearchParams(window.location.search).get("redirect") || "/"
            router.push(redirectTo)
          }
        } catch (error) {
          console.error("Check QR status failed:", error)
        }
      }, 2000)
      setPollingInterval(interval)
      setTimeout(() => {
        clearInterval(interval)
        setPollingInterval(null)
      }, 300000)
    } catch (error) {
      console.error("WeChat login error:", error)
      const errorMessage = error instanceof Error ? error.message : "未知错误"
      toast({
        title: "微信登录失败",
        description: `错误详情: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsWechatLoading(false)
      wechatLoginInProgress.current = false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">微信扫码登录</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isClient && (
            <div className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 px-4 py-3 rounded-md">
              <div className="flex items-center mb-3">
                <QrCode className="mr-2 h-4 w-4" />
                <span>使用微信扫码即可登录</span>
                {isWechatLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </div>
              <div className="flex flex-col items-center space-y-2">
                {wxacodeBase64 ? (
                  <div className="rounded-lg" style={{ backgroundColor: "#ffffff", padding: 12 }}>
                    <img src={`data:image/png;base64,${wxacodeBase64}`} alt="微信小程序码" style={{ width: 420, height: "auto", display: "block" }} />
                  </div>
                ) : (
                  <span className="text-white/60 text-sm">正在生成小程序码...</span>
                )}
                <span className="text-white/70 text-xs">请用微信扫描上方小程序码完成登录</span>
                <Button
                  type="button"
                  className="mt-2 bg-cyan-500 text-black hover:bg-cyan-600"
                  onClick={handleWechatLogin}
                  disabled={isWechatLoading}
                >
                  刷新二维码
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter />
      </Card>
    </motion.div>
  )
}
