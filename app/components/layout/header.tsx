'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, User as UserIcon, Menu, X, LogOut, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { authManager } from '../../lib/auth';
import { User } from '../../types';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 初始化用户状态
    setUser(authManager.getUser());

    // 监听认证状态变化
    const unsubscribe = authManager.addListener(() => {
      setUser(authManager.getUser());
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    authManager.logout();
    router.push('/');
    setIsMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: '首页' },
    { href: '/memory-library', label: '杏仁库' },
    { href: '/reviews', label: '复习' },
    { href: '/plans', label: '计划' },
  ];

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10',
      className
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              小杏仁
            </span>
          </Link>

          {/* 桌面导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 用户菜单 */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.nickname} className="w-6 h-6 rounded-full" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                    <span>{user.nickname || '个人中心'}</span>
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-white/60 hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    注册
                  </Button>
                </Link>
              </div>
            )}
            
            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <UserIcon className="w-4 h-4 mr-2" />
                      {user.nickname || '个人中心'}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      登录
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      立即注册
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;