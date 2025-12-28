'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-config';
import type { Almond } from '@/types';

export default function AlmondDetailPage() {
  const params = useParams();
  const idParam = params?.id as string;
  const id = Number(idParam);
  const [item, setItem] = useState<Almond | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.almonds.get(id);
        setItem(data || null);
      } catch (e: any) {
        setError(e?.message || '加载失败');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <MainLayout>
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">杏仁详情</h1>
          <Button variant="ghost" onClick={() => history.back()}>返回</Button>
        </div>

        {loading && <p className="text-white/70">加载中...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && item && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <span className="text-xs text-white/60">{item.status || 'new'}</span>
            </div>
            <p className="text-sm text-white/80 mb-4">{item.description || ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
              <div>优先级：{typeof item.priority === 'number' ? item.priority : 0}</div>
              <div>层级：{item.level || 'inbox'}</div>
              <div>开始时间：{item.startDate || '-'}</div>
              <div>结束时间：{item.endDate || '-'}</div>
            </div>
          </Card>
        )}
      </main>
    </MainLayout>
  );
}
