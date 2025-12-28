'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, Loader2, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { MainLayout } from '../components/layout/main-layout';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { api } from '../lib/api-config';
import { authManager } from '../lib/auth';
import type { Almond } from '../types';

const PLACEHOLDERS = [
  "「刚想到的一件事」",
  "「一个模糊的想法」", 
  "「最近反复出现的念头」",
  "「今天发生的一件事」"
];

export default function HomePage() {
  const [inputValue, setInputValue] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<Almond[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // 轮播placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    setIsAuthenticated(!!authManager.getToken());
    const unsub = authManager.addListener(() => {
      setIsAuthenticated(!!authManager.getToken());
    });
    return () => unsub();
  }, []);
  
  const loadList = async () => {
    if (!authManager.getToken()) return;
    setListLoading(true);
    setListError(null);
    try {
      const res = await api.almonds.list({ pageNo: 1, pageSize: 5 });
      setItems(res.data || []);
    } catch (e: any) {
      setListError(e?.message || '加载失败');
    } finally {
      setListLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      loadList();
    } else {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      await api.almonds.create({
        title: inputValue.trim(),
        description: inputValue.trim(),
        level: 'inbox',
        priority: 0,
        tags: []
      });
      setInputValue('');
      await loadList();
    } catch (err) {
    }
    setIsLoading(false);
  };

  return (
    <MainLayout>
      {/* 主要内容 */}
      <main className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Hero 区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl mb-6"
            >
              <Brain className="w-8 h-8 text-black" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              小杏仁
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 mb-2">
              👋 欢迎来到小杏仁，这里不是任务清单，也不是笔记本
            </p>
            
            <p className="text-lg text-white/60">
              想到什么，先放一颗杏仁
            </p>
          </motion.div>

          {/* 输入区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pr-24 text-lg py-4"
                  placeholder=""
                  disabled={isLoading}
                />
                
                {/* 动态Placeholder */}
                {!inputValue && (
                  <div className="absolute inset-0 flex items-center px-6 pointer-events-none overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="w-full text-white/40 text-lg truncate"
                      >
                        {PLACEHOLDERS[placeholderIndex]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 w-12"
                disabled={isLoading || !isAuthenticated}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
            
            {!isAuthenticated && (
              <p className="mt-3 text-center text-sm text-white/50">
                请先<a href="/auth/login" className="text-cyan-400 hover:text-cyan-300 underline">登录</a>后使用
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {listLoading && (
              <p className="text-white/70">列表加载中...</p>
            )}
            {listError && (
              <p className="text-red-400">{listError}</p>
            )}
            {items.length > 0 && !listLoading && !listError && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white/80">可以展开的想法</h2>
                  <div className="text-sm text-white/50">{items.length} 颗</div>
                </div>
                {items.map((item) => (
                  <Link key={item.id} href={`/almonds/${item.id}`} className="block group">
                    <div className="bg-white/5 group-hover:bg-white/10 rounded-2xl border border-white/10 p-5 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span className="text-xs text-white/60">{item.status || 'new'}</span>
                      </div>
                      <p className="text-sm text-white/80 line-clamp-2">{item.description || ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {items.length === 0 && !listLoading && !listError && (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">还没有杏仁，先在上面的输入框创建吧</p>
              </div>
            )}
          </motion.div>

          {/* 功能介绍 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">智能分析</h3>
              <p className="text-white/60 text-sm">AI 自动分析你的想法，提供记忆辅助和行动建议</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">智能复习</h3>
              <p className="text-white/60 text-sm">基于记忆曲线，在最佳时间提醒复习重要内容</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">行动转化</h3>
              <p className="text-white/60 text-sm">将想法转化为具体任务，AI 协助制定执行计划</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-md flex items-center justify-center">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-white">小杏仁</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-white/60">
              <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-4">
                <span>© 2026 小杏仁. 保留所有权利</span>
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                  浙ICP备2024091992号-3
                </a>
              </div>
              <div className="flex space-x-4">
                <a href="/privacy" className="hover:text-cyan-400 transition-colors">隐私政策</a>
                <a href="/terms" className="hover:text-cyan-400 transition-colors">使用条款</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}