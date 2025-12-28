'use client';

import React from 'react';
import { Brain } from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout';
import ForgotPasswordForm from '../../../components/auth/forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
           {/* Logo 和标题 */}
           <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl mb-4">
              <Brain className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">忘记密码</h1>
            <p className="text-white/60">输入邮箱以重置密码</p>
          </div>
          
          <ForgotPasswordForm />
        </div>
      </div>
    </MainLayout>
  );
}
