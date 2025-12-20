"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api-config"
import { getUserFriendlyError } from "@/lib/error-handler"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "请输入邮箱",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      await api.auth.forgotPassword(email)

      toast({
        title: "验证码已发送",
        description: "验证码已发送至您的邮箱，请在接下来的步骤中使用它",
      })

      // Redirect to reset password page with email
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="w-full max-w-md"
    >
      <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500" />

        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            <KeyRound className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            忘记密码？
          </CardTitle>
          <CardDescription className="text-gray-400 text-sm">
            请输入您的邮箱地址，我们将为您发送验证码
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-medium text-gray-300 transition-colors group-focus-within:text-cyan-400">
                邮箱地址
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-white/5 bg-white/5 pl-10 text-white placeholder:text-gray-600 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all rounded-xl"
                  disabled={isLoading}
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
                  正在发送...
                </div>
              ) : (
                "获取重置验证码"
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
