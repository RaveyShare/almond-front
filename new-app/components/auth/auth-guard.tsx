'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authManager } from '../../lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 需要认证的页面路径
    const protectedPaths = ['/profile', '/auth/change-password'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    
    if (isProtectedPath) {
      const checkAuth = () => {
        const authenticated = authManager.isAuthenticated();
        setIsAuthenticated(authenticated);
        setIsLoading(false);
        
        if (!authenticated) {
          router.push('/auth/login');
        }
      };

      checkAuth();
      
      // 监听认证状态变化
      const unsubscribe = authManager.addListener(checkAuth);
      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">加载中...</div>
      </div>
    );
  }

  // 如果是受保护的路径且未认证，不渲染内容（正在重定向）
  const protectedPaths = ['/profile', '/auth/change-password'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};