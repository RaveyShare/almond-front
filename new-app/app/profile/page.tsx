'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Settings, LogOut, Edit3, Save, X } from 'lucide-react';
import { MainLayout } from '../../components/layout/main-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { authManager } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(authManager.getUser());
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const currentUser = authManager.getUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    setUser(currentUser);
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
    });

    // 监听认证状态变化
    const unsubscribe = authManager.addListener(() => {
      const updatedUser = authManager.getUser();
      if (!updatedUser) {
        router.push('/auth/login');
      } else {
        setUser(updatedUser);
        setFormData({
          username: updatedUser.username,
          email: updatedUser.email,
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = () => {
    authManager.logout();
    router.push('/');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setErrors({});
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_USER_CENTER_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authManager.getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '更新失败');
      }

      const updatedUser = await response.json();
      // 更新本地存储的用户信息
      const authResponse = {
        token: authManager.getToken()!,
        refreshToken: localStorage.getItem('almond_refresh_token') || '',
        user: updatedUser,
      };
      authManager.saveToStorage(authResponse);
      
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error: any) {
      setErrors({ general: error.message || '更新失败，请重试' });
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

  if (!user) {
    return null;
  }

  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-white">个人中心</h1>
              <div className="flex items-center space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      loading={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      保存
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEdit}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                )}
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm mb-6">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-cyan-400" />
                  基本信息
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      用户名
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="请输入用户名"
                        error={errors.username}
                      />
                    ) : (
                      <div className="text-white">{user.username}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      邮箱地址
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="请输入邮箱地址"
                        error={errors.email}
                      />
                    ) : (
                      <div className="text-white flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">
                      注册时间
                    </label>
                    <div className="text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-violet-400" />
                  账户设置
                </h2>

                <div className="space-y-4">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => router.push('/auth/change-password')}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    修改密码
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full justify-start text-red-400 hover:text-red-300"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">使用统计</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-400">0</div>
                  <div className="text-white/60 text-sm">杏仁总数</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-violet-400">0</div>
                  <div className="text-white/60 text-sm">今日学习</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">0</div>
                  <div className="text-white/60 text-sm">连续天数</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}