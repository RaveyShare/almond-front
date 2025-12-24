'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { MainLayout } from '../../../components/layout/main-layout';
import { RegisterForm } from '../../../components/auth/register-form';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    router.push('/auth/login');
  };

  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo 和标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">创建账户</h1>
            <p className="text-white/60">开始你的杏仁之旅</p>
          </motion.div>

          {/* 注册表单 */}
          <RegisterForm onSuccess={handleRegisterSuccess} />
        </div>
      </div>
    </MainLayout>
  );
}
