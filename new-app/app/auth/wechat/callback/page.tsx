'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '../../../../components/layout/main-layout';
import { authManager } from '../../../../lib/auth';

export default function WechatCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const handleWechatCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setError('微信登录失败，请重试');
        setLoading(false);
        return;
      }

      if (!code) {
        setError('缺少授权码，请重试');
        setLoading(false);
        return;
      }

      try {
        await authManager.wechatLogin(code);
        router.push('/');
      } catch (err: any) {
        setError(err.message || '微信登录失败');
        setLoading(false);
      }
    };

    handleWechatCallback();
  }, [searchParams, router]);

  return (
    <MainLayout showBackground={true}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          {loading ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl mb-4 mx-auto">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">正在处理微信登录...</h1>
              <p className="text-white/60">请稍候</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-2xl mb-4 mx-auto">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">微信登录失败</h1>
              <p className="text-white/60 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  返回登录
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  返回首页
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}