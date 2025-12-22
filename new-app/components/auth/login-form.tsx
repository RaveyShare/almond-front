'use client';

import React, { useState } from 'react';
// import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, QrCode } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { authManager } from '../../lib/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onWechatLogin?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onWechatLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      await authManager.login(formData.email, formData.password);
      onSuccess?.();
    } catch (error: any) {
      setErrors({ general: error.message || '登录失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">欢迎回来</h2>
          <p className="text-white/60">登录你的小杏仁账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              {errors.general}
            </div>
          )}
          
          <Input
            type="email"
            label="邮箱地址"
            placeholder="请输入邮箱地址"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            error={errors.email}
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="密码"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={errors.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-white/20 bg-white/10" />
              <span className="ml-2 text-sm text-white/60">记住我</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300">
              忘记密码？
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={!formData.email || !formData.password}
          >
            登录
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-white/60">或者</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={onWechatLogin}
            >
              <QrCode className="w-5 h-5 mr-2" />
              微信登录
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            还没有账户？{' '}
            <Link href="/auth/register" className="text-cyan-400 hover:text-cyan-300 font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
