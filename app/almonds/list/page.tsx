'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Star,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { almondApi } from '@/lib/almond-api';
import {
  AlmondListItem,
  AlmondListParams,
  AlmondStatus,
  AlmondFinalType,
  statusConfig,
  finalTypeConfig
} from '@/lib/almond-types';
import { formatRelativeTime } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function AlmondsListPage() {
  const router = useRouter();

  // 列表数据
  const [almonds, setAlmonds] = useState<AlmondListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState<any>(null);

  // 加载状态
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 筛选和排序参数
  const [filters, setFilters] = useState<{
    almondStatus?: AlmondStatus;
    finalType?: AlmondFinalType;
    starred?: 0 | 1;
    keyword: string;
    sortBy: 'update_time' | 'create_time' | 'maturity_score';
    sortOrder: 'asc' | 'desc';
  }>({
    keyword: '',
    sortBy: 'update_time',
    sortOrder: 'desc'
  });

  // 分页参数
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  // 展开筛选面板
  const [showFilters, setShowFilters] = useState(false);

  // 防抖搜索
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: searchInput }));
      setPageNum(1); // 重置页码
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // 获取列表数据
  const fetchAlmonds = useCallback(async (page: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
      }

      const params: AlmondListParams = {
        pageNum: page,
        pageSize,
        ...filters
      };

      const response = await almondApi.getAlmondList(params);

      if (isLoadMore) {
        setAlmonds(prev => [...prev, ...response.list]);
      } else {
        setAlmonds(response.list);
      }

      setTotal(response.total);
      setStatistics(response.statistics);
      setHasMore(response.list.length === pageSize);

    } catch (error: any) {
      toast.error(error.message || '获取列表失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, pageSize]);

  // 初始加载
  useEffect(() => {
    fetchAlmonds(1);
  }, [filters]);

  // 加载更多
  const handleLoadMore = () => {
    const nextPage = pageNum + 1;
    setPageNum(nextPage);
    fetchAlmonds(nextPage, true);
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    setPageNum(1);
    fetchAlmonds(1);
  };

  // 切换星标
  const toggleStar = async (item: AlmondListItem, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const newStarred = item.starred === 1 ? 0 : 1;
      await almondApi.toggleAlmondStar(item.id, newStarred === 1);

      setAlmonds(prev =>
        prev.map(almond =>
          almond.id === item.id ? { ...almond, starred: newStarred } : almond
        )
      );

      toast.success(newStarred === 1 ? '已加星标' : '已取消星标');
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  // 跳转到详情
  const goToDetail = (id: number) => {
    router.push(`/almonds/${id}/detail`);
  };

  // 渲染杏仁卡片
  const renderAlmondCard = (item: AlmondListItem) => {
    const statusCfg = statusConfig[item.almondStatus];
    const typeCfg = item.finalType ? finalTypeConfig[item.finalType] : null;

    return (
      <Card
        key={item.id}
        className="group cursor-pointer hover:shadow-lg transition-all p-5 bg-slate-800/30 backdrop-blur-sm border-slate-700/30 hover:border-slate-600/50"
        onClick={() => goToDetail(item.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 bg-gradient-to-br ${statusCfg.color} rounded-xl flex items-center justify-center border border-white/10`}>
              <span className="text-xl">{statusCfg.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {typeCfg && (
                  <span className={`text-sm ${typeCfg.color}`}>
                    {typeCfg.emoji}
                  </span>
                )}
                <h3 className="text-white font-medium truncate">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {statusCfg.label}
                </Badge>
                {typeCfg && (
                  <Badge variant="outline" className={`text-xs ${typeCfg.color}`}>
                    {typeCfg.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => toggleStar(item, e)}
            className="ml-2 flex-shrink-0"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                item.starred === 1
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-600 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs text-slate-500">成熟度</span>
            <Progress value={item.maturityScore} className="flex-1 h-1.5" />
            <span className="text-xs text-cyan-400 font-medium">{item.maturityScore}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>更新: {formatRelativeTime(item.updateTime)}</span>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">杏仁库</h1>
          <p className="text-slate-400">查看和管理所有杏仁</p>
        </div>

        {/* 统计信息 */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">总数量</div>
              <div className="text-2xl font-bold text-white">{statistics.totalCount}</div>
            </Card>
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">星标</div>
              <div className="text-2xl font-bold text-yellow-400">{statistics.starredCount}</div>
            </Card>
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">已确认</div>
              <div className="text-2xl font-bold text-emerald-400">
                {statistics.statusCount.converged || 0}
              </div>
            </Card>
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">已完成</div>
              <div className="text-2xl font-bold text-amber-400">
                {statistics.statusCount.archived || 0}
              </div>
            </Card>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="搜索标题或内容..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              筛选
              {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          {/* 筛选面板 */}
          {showFilters && (
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">状态</label>
                  <select
                    value={filters.almondStatus || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      almondStatus: e.target.value as AlmondStatus | undefined
                    }))}
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">全部</option>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.emoji} {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">类型</label>
                  <select
                    value={filters.finalType || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      finalType: e.target.value as AlmondFinalType | undefined
                    }))}
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">全部</option>
                    {Object.entries(finalTypeConfig).map(([key, cfg]) => (
                      <option key={key} value={key}>
                        {cfg.emoji} {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">星标</label>
                  <select
                    value={filters.starred !== undefined ? filters.starred : ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      starred: e.target.value ? (parseInt(e.target.value) as 0 | 1) : undefined
                    }))}
                    className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="">全部</option>
                    <option value="1">仅星标</option>
                    <option value="0">非星标</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="text-sm text-slate-400 mb-2 block">排序</label>
                <div className="flex gap-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as any
                    }))}
                    className="flex-1 bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="update_time">更新时间</option>
                    <option value="create_time">创建时间</option>
                    <option value="maturity_score">成熟度</option>
                  </select>

                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({
                      ...prev,
                      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                    }))}
                    className="gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {filters.sortOrder === 'asc' ? '升序' : '降序'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* 列表 */}
        {loading && almonds.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : almonds.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg mb-2">暂无数据</p>
            <p className="text-sm">试试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {almonds.map(item => renderAlmondCard(item))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '加载更多'
                  )}
                </Button>
              </div>
            )}

            {!hasMore && almonds.length > 0 && (
              <div className="text-center text-slate-500 py-8">
                已加载全部 {total} 条数据
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
