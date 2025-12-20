"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, User, Loader2, QrCode, X, CheckCircle2, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/lib/api-config"
import { getUserFriendlyError } from "@/lib/error-handler"
import QRCode from "qrcode"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isWechatLoading, setIsWechatLoading] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [wxacodeBase64, setWxacodeBase64] = useState<string>("")
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 验证码倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "请输入邮箱",
        variant: "destructive",
      })
      return
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingCode(true)
      await api.auth.sendCode(email, 1) // 1-注册
      setCountdown(60)
      toast({
        title: "验证码已发送",
        description: "请查收您的邮箱",
      })
    } catch (error) {
      const errorInfo = getUserFriendlyError(error)
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      })
    } finally {
      setIsSendingCode(false)
    }
  }

  const validateForm = () => {
    if (!name || !email || !password || !code) {
      toast({
        title: "请填写所有必填字段",
        variant: "destructive",
      })
      return false
    }

    if (password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码至少需要6个字符",
        variant: "destructive",
      })
      return false
    }

    if (!acceptTerms) {
      toast({
        title: "请接受服务条款",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)

      console.log('开始注册流程...')
      const result = await api.auth.emailRegister({ name, email, password, code })
      console.log('注册成功，结果:', result)

      toast({
        title: "注册成功",
        description: `欢迎加入，${name}！`,
      })

      console.log('等待AuthGuard自动处理重定向...')
      // 不再手动跳转，让AuthGuard自动处理重定向
    } catch (error) {
      const errorInfo = getUserFriendlyError(error)
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWechatLogin = async () => {
    if (isWechatLoading) return

    try {
      setIsWechatLoading(true)
      const { qrcodeId } = await api.frontAuth.generateQr('wxe6d828ae0245ab9c')
      const env = (process.env.NEXT_PUBLIC_WXA_ENV || 'trial') as 'release' | 'trial' | 'develop'
      const wxacode = await api.frontAuth.generateWxacode('wxe6d828ae0245ab9c', qrcodeId, 'pages/auth/login/login', 430, env)
      setWxacodeBase64(wxacode.imageBase64)
      setShowQrCode(true)

      const interval = setInterval(async () => {
        try {
          const res = await api.frontAuth.checkQr(qrcodeId)
          if (res.status === 2 && res.token) {
            clearInterval(interval)
            setShowQrCode(false)

            // 构造用户对象
            const user = {
              id: String(res.userInfo?.id || ''),
              name: res.userInfo?.nickname || '用户',
              email: '', // Needed by User type
              avatar: res.userInfo?.avatarUrl,
              createdAt: new Date().toISOString(),
            }

            // 这里 api.auth.setAuth 或类似逻辑已经在 api-config 中处理了吗？
            // 在 api-config.ts 中，wechatMiniLogin 会调用 authManager.setAuth
            // 但是 checkQr 是直接返回的。我们需要手动设置。
            const { authManager } = await import('@/lib/auth')
            authManager.setAuth({ user, token: res.token, refreshToken: '' })

            toast({ title: '登录成功', description: `欢迎回来，${user.name}！` })
            router.push('/')
          }
        } catch (err) {
          console.error('Check QR failed:', err)
        }
      }, 2000)
      setPollingInterval(interval)
    } catch (error) {
      toast({
        title: '微信连接失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setIsWechatLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [pollingInterval])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            创建新账户
          </CardTitle>
          <CardDescription className="text-center text-gray-400 text-sm">
            加入 10,000+ 用户，开启高效记忆之旅
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {/* Nickname */}
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                昵称
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="name"
                  placeholder="你想被如何称呼？"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                邮箱
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-2 group">
              <Label htmlFor="code" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                验证码
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="code"
                    placeholder="6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="h-11 border-white/5 bg-white/5 pl-10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-xl"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || isSendingCode}
                  className="h-11 px-4 min-w-[100px] bg-white/10 hover:bg-white/20 border-white/5 text-white rounded-xl transition-all active:scale-95"
                >
                  {isSendingCode ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    "发送验证码"
                  )}
                </Button>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 pr-10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-400 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                我已阅读并同意{" "}
                <Link href="/terms" className="text-cyan-400 hover:underline">
                  服务协议
                </Link>{" "}
                与{" "}
                <Link href="/privacy" className="text-cyan-400 hover:underline">
                  隐私保护指引
                </Link>
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在处理...
                </div>
              ) : (
                "立即注册"
              )}
            </Button>

            <div className="relative w-full py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0a0a0a] px-3 text-gray-500">第三方登录</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all border-dashed"
              onClick={handleWechatLogin}
              disabled={isWechatLoading}
            >
              {isWechatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <QrCode className="h-4 w-4" />
                  微信扫码安全登录
                </div>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              已经有账户了？{" "}
              <Link href="/auth/login" className="text-white font-medium hover:text-cyan-400 transition-colors">
                去登录
              </Link>
            </p>
          </CardFooter>
        </form>

        {/* Success Indicator Overlay (Optional/Future) */}
      </Card>

      {/* WeChat QR Modal */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 backdrop-blur-2xl rounded-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-white">微信安全登录</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="relative group p-4 bg-white rounded-3xl shadow-2xl shadow-cyan-500/10">
              <AnimatePresence mode="wait">
                {wxacodeBase64 ? (
                  <motion.img
                    key="qr"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={`data:image/png;base64,${wxacodeBase64}`}
                    alt="微信小程序码"
                    className="w-56 h-56"
                  />
                ) : (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-56 h-56 flex items-center justify-center bg-gray-50 rounded-2xl"
                  >
                    <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-300 font-medium">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                请使用微信扫码确认
              </div>
              <p className="text-xs text-gray-500 max-w-[240px]">
                无需注册，扫码后点击“确定”即可完成注册与登录
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQrCode(false)}
              className="text-gray-500 hover:text-white"
            >
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
