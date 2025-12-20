"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-config"
import { getUserFriendlyError } from "@/lib/error-handler"

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const validateForm = () => {
    if (!email || !code || !password || !confirmPassword) {
      toast({
        title: "请填写所有字段",
        variant: "destructive",
      })
      return false
    }

    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致",
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

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsLoading(true)

      await api.auth.emailResetPassword({
        email,
        code,
        newPassword: password
      })

      setIsSuccess(true)
      toast({
        title: "密码重置成功",
        description: "您的密码已成功重置，正在跳转至登录页",
      })

      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)

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

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl text-center py-8 shadow-2xl">
          <CardContent className="space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">重置成功</CardTitle>
            <p className="text-gray-400">您的密码已更新。请使用新密码登录您的账户。</p>
            <Button
              onClick={() => router.push('/auth/login')}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-black font-bold h-12 rounded-xl"
            >
              立即登录
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold text-center tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            重置您的密码
          </CardTitle>
          <CardDescription className="text-center text-gray-400 text-sm">
            请输入验证码及您的新密码
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {/* Email (Readonly if from param) */}
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                邮箱
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-white rounded-xl"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-2 group">
              <Label htmlFor="code" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                验证码
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="code"
                  placeholder="6位验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-white rounded-xl focus:border-cyan-500/50 transition-all font-mono tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2 group">
              <Label htmlFor="password" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                新密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 pr-10 text-white rounded-xl focus:border-cyan-500/50 transition-all"
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

            {/* Confirm New Password */}
            <div className="space-y-2 group">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                确认新密码
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 pr-10 text-white rounded-xl focus:border-cyan-500/50 transition-all"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-8">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在重置...
                </div>
              ) : (
                "确认重置密码"
              )}
            </Button>

            <Link
              href="/auth/login"
              className="flex items-center justify-center text-sm text-gray-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回登录
            </Link>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}