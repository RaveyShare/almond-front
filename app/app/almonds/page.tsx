'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '../../components/layout/main-layout';
import { Header } from '../../components/layout/header';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
import { api } from '../../lib/api-config';
import type { Almond } from '../../types';
import { authManager } from '../../lib/auth';

export default function AlmondsPage() {
  const [items, setItems] = useState<Almond[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 使用 useEffect 确保客户端状态一致性，避免 hydration 错误
  useEffect(() => {
    setIsAuthenticated(!!authManager.getToken());
  }, []);

  const loadData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.almonds.list({ status: statusFilter, pageNo: page, pageSize });
      setItems(res.data || []);
      setPageNo(res.pageNo || page);
      setPageSize(res.pageSize || pageSize);
      setTotal(res.total || 0);
    } catch (e: any) {
      setError(e?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await api.almonds.create({
        title: title.trim(),
        description: description.trim() || title.trim(),
        level: 'inbox',
        priority: 0,
        tags: []
      });
      setTitle('');
      setDescription('');
      await loadData(1);
    } catch (e: any) {
      setError(e?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <MainLayout>
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">杏仁列表</h1>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || undefined)}
              className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm"
            >
              <option value="">全部状态</option>
              <option value="new">new</option>
              <option value="todo">todo</option>
              <option value="doing">doing</option>
              <option value="done">done</option>
            </select>
          </div>
        </div>

        <Card className="p-4 mb-8">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="标题"
              disabled={loading || !isAuthenticated}
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述"
              disabled={loading || !isAuthenticated}
            />
            <Button type="submit" disabled={loading || !isAuthenticated}>
              {loading ? '处理中...' : '创建杏仁'}
            </Button>
          </form>
          {!isAuthenticated && (
            <p className="mt-2 text-sm text-white/60">请先登录后再创建</p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </Card>

        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white/80">可以展开的想法</h2>
              <div className="text-sm text-white/50">{items.length} 颗</div>
            </div>
            {items.map((item) => (
              <Link key={item.id} href={`/almonds/${item.id}`} className="block group">
                <div className="bg-slate-800/40 group-hover:bg-slate-800/60 rounded-2xl border border-white/10 p-5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">{item.title}</h2>
                    <span className="text-xs text-white/60">{item.status || 'new'}</span>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{item.description || ''}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-sm">还没有杏仁，先在上面的输入框创建吧</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-white/60">
            共 {total} 条，页 {pageNo}/{totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={() => {
                const p = Math.max(1, pageNo - 1);
                setPageNo(p);
                loadData(p);
              }}
              disabled={loading || pageNo <= 1}
            >
              上一页
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const p = Math.min(totalPages, pageNo + 1);
                setPageNo(p);
                loadData(p);
              }}
              disabled={loading || pageNo >= totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
