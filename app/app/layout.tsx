import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import { AuthGuard } from '../components/auth/auth-guard'
import Header from '../components/layout/header'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: '小杏仁 - AI成长伙伴',
  description: '小杏仁是你的AI成长伙伴，帮助你记录想法、管理记忆、制定计划',
  keywords: 'AI, 记忆管理, 学习计划, 个人成长',
  authors: [{ name: '小杏仁团队' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}