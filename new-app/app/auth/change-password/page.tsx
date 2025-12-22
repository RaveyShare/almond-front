'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { MainLayout } from '../../../components/layout/main-layout';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { authManager } from '../../../lib/auth';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess(false);

    // 验证
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: '两次输入的新密码不一致' });
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setErrors({ newPassword: '新密码至少需要6位字符' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_CENTER_URL}/front/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authManager.getToken()}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '密码修改失败');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (error: any) {
      setErrors({ general: error.message || '密码修改失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">修改密码</h1>
              <p className="text-white/60">请输入当前密码和新密码</p>
            </div>

            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm mb-6">
                密码修改成功！正在跳转...
              </div>
            )}

            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm mb-6">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPassword.current ? 'text' : 'password'}
                  label="当前密码"
                  placeholder="请输入当前密码"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.currentPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword.new ? 'text' : 'password'}
                  label="新密码"
                  placeholder="请输入新密码（至少6位）"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.newPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showPassword.confirm ? 'text' : 'password'}
                  label="确认新密码"
                  placeholder="请再次输入新密码"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              >
                修改密码
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/profile')}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                返回个人中心
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
