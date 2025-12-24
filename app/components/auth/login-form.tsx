'use client';

import React, { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, QrCode, Loader2, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { authManager } from '../../lib/auth';
import { qrApi } from '../../lib/api-config';
import { useRouter } from 'next/navigation';

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

  // 扫码登录相关状态
  const [showQrCode, setShowQrCode] = useState(false);
  const [wxacodeBase64, setWxacodeBase64] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isWechatLoading, setIsWechatLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const wechatLoginInProgress = useRef(false);
  const router = useRouter();

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

  // 客户端初始化
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 扫码登录处理
  const handleWechatLogin = async (force = false) => {
    if (isWechatLoading || (!force && wechatLoginInProgress.current)) return;

    try {
      setIsWechatLoading(true);
      wechatLoginInProgress.current = true;
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // 第1步：生成二维码ID
      const { qrcodeId } = await qrApi.generateQr('wxe6d828ae0245ab9c');

      // 第2步：检查缓存
      const cacheKey = `wxacode_${qrcodeId}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setWxacodeBase64(cached);
      } else {
        // 第3步：生成小程序码图片(Base64格式)
        const env = (process.env.NEXT_PUBLIC_WXA_ENV || 'trial') as 'release' | 'trial' | 'develop';
        const wxacode = await qrApi.generateWxacode(
          'wxe6d828ae0245ab9c',
          qrcodeId,
          'pages/auth/login/login',
          430,
          env
        );
        setWxacodeBase64(wxacode.imageBase64);
        sessionStorage.setItem(cacheKey, wxacode.imageBase64);
      }
      setShowQrCode(true);

      // 轮询二维码状态
      const interval = setInterval(async () => {
        try {
          const res = await qrApi.checkQr(qrcodeId);
          if (res.status === 2 && res.token) {
            // 状态2：扫码成功并已确认
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            setShowQrCode(false);

            // 构造用户对象（注意字段名要与 AuthResponse 类型一致）
            const userInfo = {
              id: typeof res.userInfo?.id === 'number' ? res.userInfo.id : Number(res.userInfo?.id) || 0,
              nickname: res.userInfo?.nickname || '用户',
              email: res.userInfo?.email || '',
              avatarUrl: res.userInfo?.avatarUrl,
              createdAt: new Date().toISOString(),
            };
            const authData = { userInfo, token: res.token, refreshToken: '' };

            // 保存到 localStorage 并更新内存状态
            authManager.saveToStorage(authData);

            // 跳转回原页面或首页
            const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
            router.push(redirectTo);
            onSuccess?.();
          } else if (res.status === 3) {
            // 已扫码，等待确认
          }
        } catch (error) {
          console.error('Check QR status failed:', error);
        }
      }, 2000);

      setPollingInterval(interval);

      // 5分钟后停止轮询
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 300000);
    } catch (error) {
      console.error('WeChat login error:', error);
    } finally {
      setIsWechatLoading(false);
    }
  };

  // 关闭二维码对话框
  const handleCloseQrCode = () => {
    setShowQrCode(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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

          {isClient && (
            <div className="mt-6">
              <div className="w-full border border-white/10 bg-white/5 text-white hover:bg-white/10 px-4 py-3 rounded-md cursor-pointer" onClick={() => handleWechatLogin(false)}>
                <div className="flex items-center mb-3">
                  <QrCode className="mr-2 h-4 w-4" />
                  <span>使用微信扫码即可登录</span>
                  {isWechatLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                </div>
                <div className="flex flex-col items-center space-y-2">
                  {wxacodeBase64 ? (
                    <div className="rounded-lg" style={{ backgroundColor: '#ffffff', padding: 12 }}>
                      <img
                        src={`data:image/png;base64,${wxacodeBase64}`}
                        alt="微信小程序码"
                        style={{ width: 420, height: 'auto', display: 'block' }}
                      />
                    </div>
                  ) : (
                    <span className="text-white/60 text-sm">点击生成小程序码...</span>
                  )}
                  {wxacodeBase64 && (
                    <span className="text-white/70 text-xs">请用微信扫描上方小程序码完成登录</span>
                  )}
                </div>
              </div>
            </div>
          )}
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
