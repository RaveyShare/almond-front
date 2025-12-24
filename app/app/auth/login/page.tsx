'use client';

import React from 'react';
// import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout';
import LoginForm from '../../../components/auth/login-form';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    router.push('/');
  };

  const handleWechatLogin = () => {
    // 微信登录逻辑 - 重定向到微信授权页面
    const wechatAuthUrl = `${process.env.NEXT_PUBLIC_USER_CENTER_URL}/front/auth/wechat/authorize`;
    window.location.href = wechatAuthUrl;
  };

  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo 和标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
            <p className="text-white/60">登录你的小杏仁账户</p>
          </div>

          {/* 登录表单 */}
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onWechatLogin={handleWechatLogin}
          />
        </div>
      </div>
    </MainLayout>
  );
}
