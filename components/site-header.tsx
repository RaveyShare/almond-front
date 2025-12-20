"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authManager } from "@/lib/auth"
import { cn } from "@/lib/utils"

/**
 * @author Ravey
 * @since 1.0.0
 */
export function SiteHeader() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState(authManager.getCurrentUser())

  React.useEffect(() => {
    setIsAuthenticated(authManager.isAuthenticated())
    setCurrentUser(authManager.getCurrentUser())

    const unsubscribe = authManager.addListener(() => {
      setIsAuthenticated(authManager.isAuthenticated())
      setCurrentUser(authManager.getCurrentUser())
    })

    return unsubscribe
  }, [])

  const handleLogout = () => {
    authManager.clearAuth()
    router.push("/")
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link className="flex items-center space-x-2 font-bold" href="/">
          <Brain className="h-6 w-6 text-cyan-400" />
          <span>小杏仁</span>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated && currentUser ? (
            <>
              <Link href="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <img
                  src={currentUser.avatar || "/placeholder.svg"}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-sm text-white/70">欢迎, {currentUser.name}</span>
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/about">
                关于
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/reviews">
                复盘
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/memory-library">
                杏仁
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm text-white/70 hover:text-cyan-400"
              >
                退出
              </Button>
            </>
          ) : (
            <>
              <Link className="text-sm hover:text-cyan-400" href="/about">
                关于
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/auth/login">
                登录
              </Link>
              <Link className="text-sm hover:text-cyan-400" href="/auth/register">
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
