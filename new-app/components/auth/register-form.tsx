'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { authManager } from '../../lib/auth';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // 验证
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: '两次输入的密码不一致' });
      setIsLoading(false);
      return;
    }

    try {
      await authManager.register(formData.username, formData.email, formData.password);
      onSuccess?.();
    } catch (error: any) {
      setErrors({ general: error.message || '注册失败，请重试' });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">创建账户</h2>
          <p className="text-white/60">开始你的杏仁之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
              {errors.general}
            </div>
          )}
          
          <Input
            type="text"
            label="用户名"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            icon={<User className="w-4 h-4" />}
            error={errors.username}
            required
          />

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
              placeholder="请输入密码（至少6位）"
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

          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              label="确认密码"
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-white/40 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="rounded border-white/20 bg-white/10"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-white/60">
              我同意{' '}
              <a href="/terms" className="text-cyan-400 hover:text-cyan-300">使用条款</a>
              {' '}和{' '}
              <a href="/privacy" className="text-cyan-400 hover:text-cyan-300">隐私政策</a>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={!formData.username || !formData.email || !formData.password || !formData.confirmPassword}
          >
            创建账户
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60">
            已有账户？{' '}
            <Link href="/auth/login" className="text-cyan-400 hover:text-cyan-300 font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};