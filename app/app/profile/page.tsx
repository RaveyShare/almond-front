'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Settings, LogOut, Edit3, Save, X, Lock, Camera } from 'lucide-react';
import { MainLayout } from '../../components/layout/main-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { authManager } from '../../lib/auth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof authManager.getUser>>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    avatarUrl: '',
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
      nickname: currentUser.nickname,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl || '',
    });

    // 监听认证状态变化
    const unsubscribe = authManager.addListener(() => {
      const updatedUser = authManager.getUser();
      if (!updatedUser) {
        router.push('/auth/login');
      } else {
        setUser(updatedUser);
        setFormData({
          nickname: updatedUser.nickname,
          email: updatedUser.email,
          avatarUrl: updatedUser.avatarUrl || '',
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
      nickname: user?.nickname || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nickname: user?.nickname || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    });
    setErrors({});
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ general: '图片大小不能超过 5MB' });
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setIsLoading(true);
      // 使用统一的 /api/user-center 代理
      const response = await fetch(`/api/user-center/front/users/avatar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authManager.getToken()}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const res = await response.json();
      // 适配不同的返回结构：优先取 data，如果 data 为空，尝试从 message 中获取 URL
      let uploadedUrl = res.data;
      
      // 如果 data 为空，且 message 看起来像 URL（包含 http），则尝试清理并使用 message
      if (!uploadedUrl && res.message && (typeof res.message === 'string') && res.message.includes('http')) {
        // 去除可能存在的反引号、引号或首尾空格
        uploadedUrl = res.message.replace(/[`"'\s]/g, '');
      }

      if (!uploadedUrl) {
        throw new Error('未获取到头像地址');
      }

      setFormData(prev => ({ ...prev, avatarUrl: uploadedUrl }));
    } catch (error) {
      console.error(error);
      setErrors({ general: '头像上传失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // 使用统一的 /api/user-center 代理
      const response = await fetch(`/api/user-center/front/users/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authManager.getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || '更新失败');
      }

      // 检查业务状态码
      if (res.code !== 0 && res.code !== 200) {
        throw new Error(res.message || '更新失败');
      }

      let updatedUser = res.data;

      // 处理后端返回数据格式不一致的问题
      // 1. 如果后端返回的是 avatar 而不是 avatarUrl，进行映射
      if (updatedUser.avatar && !updatedUser.avatarUrl) {
        updatedUser.avatarUrl = updatedUser.avatar;
      }
      
      // 2. 清理 avatarUrl 中的异常字符（如反引号、空格）
      if (updatedUser.avatarUrl && typeof updatedUser.avatarUrl === 'string') {
        updatedUser.avatarUrl = updatedUser.avatarUrl.replace(/[`"'\s]/g, '');
      }
      
      // 更新本地存储的用户信息和状态
      authManager.updateUser(updatedUser);
      
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
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 relative"
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
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-white/40 hover:text-white"
                      onClick={() => router.push('/')}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* 头像区域 */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt={formData.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-violet-500/20">
                      <User className="w-12 h-12 text-white/40" />
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isLoading}
                    />
                  </label>
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
                      昵称
                    </label>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={formData.nickname}
                        onChange={(e) => handleInputChange('nickname', e.target.value)}
                        placeholder="请输入昵称"
                        error={errors.username}
                      />
                    ) : (
                      <div className="text-white">{user.nickname}</div>
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

                  {user.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-white/60 mb-2">
                        注册时间
                      </label>
                      <div className="text-white flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  )}
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