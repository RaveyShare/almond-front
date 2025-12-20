"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, Loader2, QrCode, X, ShieldCheck, Github, Chrome } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-config"
import { getUserFriendlyError } from "@/lib/error-handler"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loginType, setLoginType] = useState<"password" | "code">("password")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isWechatLoading, setIsWechatLoading] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [wxacodeBase64, setWxacodeBase64] = useState<string>("")
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const handleSendCode = async () => {
    if (!email) {
      toast({ title: "请输入邮箱", variant: "destructive" })
      return
    }
    try {
      setIsSendingCode(true)
      await api.auth.sendCode(email, 2) // 2-登录
      setCountdown(60)
      toast({ title: "验证码已发送", description: "请查收您的邮箱" })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || (loginType === "password" && !password) || (loginType === "code" && !code)) {
      toast({ title: "请填写完整信息", variant: "destructive" })
      return
    }

    try {
      setIsLoading(true)
      await api.auth.emailLogin({
        email,
        password,
        code,
        loginType: loginType === "password" ? 1 : 2
      })

      toast({ title: "登录成功", description: "欢迎回来！" })
      router.push("/")
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
      const env = (process.env.NEXT_PUBLIC_WXA_ENV || 'trial') as any
      const wxacode = await api.frontAuth.generateWxacode('wxe6d828ae0245ab9c', qrcodeId, 'pages/auth/login/login', 430, env)
      setWxacodeBase64(wxacode.imageBase64)
      setShowQrCode(true)

      const interval = setInterval(async () => {
        try {
          const res = await api.frontAuth.checkQr(qrcodeId)
          if (res.status === 2 && res.token) {
            clearInterval(interval)
            setShowQrCode(false)
            const user = {
              id: String(res.userInfo?.id || ''),
              name: res.userInfo?.nickname || '用户',
              email: '',
              avatar: res.userInfo?.avatarUrl,
              createdAt: new Date().toISOString(),
            }
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
      const errorInfo = getUserFriendlyError(error)
      toast({
        title: errorInfo.title,
        description: errorInfo.description,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-3xl font-bold text-center tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            欢迎回来
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            登录以继续您的记忆优化旅程
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <Tabs defaultValue="password" onValueChange={(v) => setLoginType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl mb-6">
              <TabsTrigger value="password" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">密码登录</TabsTrigger>
              <TabsTrigger value="code" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">验证码登录</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-white/5 bg-white/5 pl-10 text-white rounded-xl focus:border-cyan-500/50"
                    required
                  />
                </div>
              </div>

              <TabsContent value="password" stroke-width="0" className="m-0 space-y-4">
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-300">密码</Label>
                    <Link href="/auth/forgot-password?from=login" className="text-xs text-cyan-400 hover:underline">忘记密码？</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-white/5 bg-white/5 pl-10 pr-10 text-white rounded-xl focus:border-cyan-500/50"
                      required={loginType === "password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" stroke-width="0" className="m-0 space-y-4">
                <div className="space-y-2 group">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-300">验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                      <Input
                        id="code"
                        placeholder="6位验证码"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="h-11 border-white/5 bg-white/5 pl-10 text-white rounded-xl focus:border-cyan-500/50"
                        maxLength={6}
                        required={loginType === "code"}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || isSendingCode}
                      className="h-11 px-4 min-w-[100px] bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                      {isSendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : countdown > 0 ? `${countdown}s` : "获取"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <Button
                type="submit"
                className="w-full h-12 mt-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </form>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-6 pt-2 pb-8">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-black/40 px-3 text-gray-500">更多方式</span></div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="h-11 border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl"
              onClick={handleWechatLogin}
            >
              <QrCode className="h-4 w-4 mr-2 text-green-500" /> 微信扫码登录
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500">
            还没有账户？{" "}
            <Link href="/auth/register" className="text-white font-medium hover:text-cyan-400 transition-colors">立即注册</Link>
          </p>
        </CardFooter>
      </Card>

      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md border-white/10 bg-black/90 backdrop-blur-2xl rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold text-center text-white">微信安全登录</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="p-4 bg-white rounded-3xl">
              {wxacodeBase64 ? (
                <img src={`data:image/png;base64,${wxacodeBase64}`} alt="微信码" className="w-48 h-48" />
              ) : (
                <Loader2 className="h-48 w-48 animate-spin text-cyan-500" />
              )}
            </div>
            <p className="text-gray-300 text-sm">请使用微信扫一扫</p>
            <Button variant="ghost" size="sm" onClick={() => setShowQrCode(false)} className="text-gray-500">取消</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
