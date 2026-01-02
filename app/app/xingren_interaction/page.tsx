'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Almond } from '../../types';

export default function XingRenApp() {
  type ExtAlmond = Almond & {
    almondType?: 'memory' | 'action' | 'goal';
    aiSuggestion?: string;
    progressPercent?: number;
  };
  const [items, setItems] = useState<ExtAlmond[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toRelative = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}分钟前`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}小时前`;
    const d = Math.floor(h / 24);
    return `${d}天前`;
  };

  const MOCK_ITEMS: ExtAlmond[] = [
    {
      id: 1,
      userId: 1,
      title: '学习 Rust 的所有权机制',
      description: '理解所有权、借用和生命周期，掌握核心概念与常见用法',
      almondStatus: 'new',
      aiClassification: 'memory',
      classificationConfidence: 0.92,
      evolutionStage: 1,
      aiAnalysisCount: 3,
      userFeedback: '',
      taskType: '',
      level: 'inbox',
      status: 'new',
      priority: 0,
      tags: ['Rust', '系统编程'],
      startDate: '',
      endDate: '',
      createTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      updateTime: new Date().toISOString(),
      almondType: 'memory',
      aiSuggestion: '这颗杏仁看起来像是一个【记忆】，要不要让我帮你照看？'
    },
    {
      id: 2,
      userId: 1,
      title: '周五之前完成产品原型设计',
      description: '完成核心流程原型并评审，通过后进入迭代开发',
      almondStatus: 'todo',
      aiClassification: 'action',
      classificationConfidence: 0.87,
      evolutionStage: 2,
      aiAnalysisCount: 5,
      userFeedback: '',
      taskType: 'design',
      level: 'week',
      status: 'doing',
      priority: 1,
      tags: ['设计', '原型'],
      startDate: '',
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updateTime: new Date().toISOString(),
      almondType: 'action',
      aiSuggestion: '建议拆分为「线框图」「关键交互」「评审安排」三步'
    },
    {
      id: 3,
      userId: 1,
      title: '提升团队协作效率',
      description: '推进统一协作规范与工具链，度量与持续改进',
      almondStatus: 'doing',
      aiClassification: 'goal',
      classificationConfidence: 0.9,
      evolutionStage: 3,
      aiAnalysisCount: 8,
      userFeedback: '',
      taskType: 'process',
      level: 'quarter',
      status: 'doing',
      priority: 2,
      tags: ['团队', '效率'],
      startDate: '',
      endDate: '',
      createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date().toISOString(),
      almondType: 'goal',
      aiSuggestion: '该目标可设置阶段性里程碑，当前进度 40%',
      progressPercent: 40
    }
  ];

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      setItems(MOCK_ITEMS);
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">杏仁首页</h1>
          <p className="text-slate-400 text-sm">展示最近杏仁，包含时间、类型与AI建议</p>
        </div>

        {loading && <p className="text-white/70">加载中...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="block group cursor-default">
                <div className="bg-slate-800/40 group-hover:bg-slate-800/60 rounded-2xl border border-white/10 p-5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded-md text-xs bg-white/10 border border-white/10">
                        {item.almondType === 'memory' ? '记忆' : item.almondType === 'action' ? '行动' : '目标'}
                      </span>
                      <h2 className="font-semibold">{item.title}</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-white/60">{item.status || 'new'}</span>
                      <span className="text-xs text-white/50">{toRelative(item.createTime)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2">{item.description || ''}</p>
                  {item.aiSuggestion && (
                    <div className="mt-3">
                      <div className="text-sm bg-blue-400/10 border border-blue-400/20 rounded-xl p-3 text-blue-100">
                        {item.aiSuggestion}
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <button className="text-xs px-2 py-1 rounded-md bg-green-500/20 border border-green-500/30 text-green-100">接受</button>
                        <button className="text-xs px-2 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30 text-yellow-100">修改</button>
                        <button className="text-xs px-2 py-1 rounded-md bg-slate-500/20 border border-slate-500/30 text-slate-100">忽略</button>
                      </div>
                    </div>
                  )}
                  {typeof item.progressPercent === 'number' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                        <span>进度</span>
                        <span>{item.progressPercent}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400" style={{ width: `${item.progressPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
