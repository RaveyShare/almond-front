'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { api } from '../../lib/api-config';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  // Step 1: 发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("请输入邮箱");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await api.auth.sendResetCode(email);
      setStep('reset');
      // 可以在这里加个 toast 提示 "验证码已发送"
    } catch (err: any) {
      setError(err.message || "发送验证码失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
        setError("请输入验证码");
        return;
    }
    if (!newPassword || !confirmPassword) {
        setError("请输入新密码");
        return;
    }
    if (newPassword !== confirmPassword) {
        setError("两次输入的密码不一致");
        return;
    }
    if (newPassword.length < 8) {
        setError("密码长度至少8位");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.auth.resetPassword(email, newPassword, code);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
        setError(err.message || "重置失败，请检查验证码是否正确");
    } finally {
      setIsLoading(false);
    }
  };

  // 成功状态
  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
            <div className="rounded-full bg-green-500/20 p-4">
                <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-white">密码重置成功</h2>
        <p className="text-white/70">
            您的密码已成功重置，即将跳转到登录页面
        </p>
        <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
        >
            前往登录
        </Button>
      </div>
    );
  }

  // 第一步：输入邮箱
  if (step === 'email') {
    return (
        <form onSubmit={handleSendCode} className="space-y-6">
           <div className="space-y-2">
               <Input
                  label="邮箱"
                  type="email"
                  placeholder="输入您的邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                  error={error || undefined}
                  disabled={isLoading}
                  required
               />
               <p className="text-xs text-white/50 px-1">
                   我们将向该邮箱发送一个6位数的验证码
               </p>
           </div>
           
           <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
           >
              获取验证码
           </Button>
    
           <Link
              href="/auth/login"
              className="flex items-center justify-center text-sm text-white/70 hover:text-cyan-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回登录
            </Link>
        </form>
      );
  }

  // 第二步：输入验证码和新密码
  return (
    <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
                <span className="text-white/70 text-sm">{email}</span>
                <button 
                    type="button" 
                    onClick={() => { setStep('email'); setError(null); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                    修改
                </button>
            </div>

            <Input
                label="验证码"
                type="text"
                placeholder="输入6位验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                icon={<KeyRound className="h-4 w-4" />}
                disabled={isLoading}
                required
            />

            <Input
                label="新密码"
                type={showPassword ? "text" : "password"}
                placeholder="输入新密码 (至少8位)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                suffix={
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                    >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                }
                disabled={isLoading}
                required
            />

            <Input
                label="确认密码"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="再次输入新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="h-4 w-4" />}
                suffix={
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                    >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                }
                error={error || undefined}
                disabled={isLoading}
                required
            />
        </div>
       
       <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
       >
          重置密码
       </Button>

       <Link
          href="/auth/login"
          className="flex items-center justify-center text-sm text-white/70 hover:text-cyan-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回登录
        </Link>
    </form>
  );
}
