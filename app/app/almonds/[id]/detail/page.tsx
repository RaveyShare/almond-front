'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Sparkles,
  Tag,
  ChevronDown,
  ChevronRight,
  Edit,
  Brain,
  CheckCircle2
} from 'lucide-react';
import { almondApi } from '@/lib/almond-api';
import {
  AlmondDetail,
  statusConfig,
  finalTypeConfig,
  triggerTypeConfig,
  AiAnalysisResult
} from '@/lib/almond-types';
import { formatRelativeTime } from '@/lib/date';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function AlmondDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [detail, setDetail] = useState<AlmondDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAiSnapshots, setShowAiSnapshots] = useState(false);
  const [showMemoryAids, setShowMemoryAids] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await almondApi.getAlmondDetail(id);
      setDetail(data);
    } catch (error: any) {
      toast.error(error.message || '获取详情失败');
    } finally {
      setLoading(false);
    }
  };

  const toggleStar = async () => {
    if (!detail) return;

    try {
      const newStarred = detail.starred === 1 ? 0 : 1;
      await almondApi.toggleAlmondStar(detail.id, newStarred === 1);

      setDetail(prev => prev ? { ...prev, starred: newStarred } : null);
      toast.success(newStarred === 1 ? '已加星标' : '已取消星标');
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const parseAnalysisResult = (jsonStr: string): AiAnalysisResult => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return { raw: jsonStr };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-400">未找到该杏仁</p>
          <Button onClick={() => router.back()} className="mt-4">
            返回
          </Button>
        </div>
      </div>
    );
  }

  const statusCfg = statusConfig[detail.almondStatus];
  const typeCfg = detail.finalType ? finalTypeConfig[detail.finalType] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 头部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">返回列表</span>
          </button>

          <button
            onClick={toggleStar}
            className="flex items-center gap-2"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                detail.starred === 1
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-slate-600 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>

        {/* 主内容卡片 */}
        <Card className="p-8 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 mb-6">
          {/* 状态和类型 */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 bg-gradient-to-br ${statusCfg.color} rounded-2xl flex items-center justify-center border border-white/10`}>
              <span className="text-3xl">{statusCfg.emoji}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-sm">
                  {statusCfg.label}
                </Badge>
                {typeCfg && (
                  <>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <Badge variant="outline" className={`text-sm ${typeCfg.color}`}>
                      {typeCfg.emoji} {typeCfg.label}
                    </Badge>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{formatRelativeTime(detail.createTime)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">成熟度</span>
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${detail.maturityScore}%` }}
                    />
                  </div>
                  <span className="text-xs text-cyan-400 font-medium">{detail.maturityScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-2xl font-bold text-white mb-6">{detail.title}</h1>

          {/* 原始内容 */}
          <div className="mb-4">
            <div className="bg-slate-700/20 rounded-xl p-4 border border-slate-600/20">
              <div className="text-xs text-slate-500 mb-2">原始内容</div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{detail.content}</p>
            </div>
          </div>

          {/* AI 澄清后的内容 */}
          {detail.clarifiedContent && (
            <div className="mb-6">
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">AI 澄清后</span>
                </div>
                <p className="text-sm text-blue-200 whitespace-pre-wrap">{detail.clarifiedContent}</p>
              </div>
            </div>
          )}

          {/* 标签 */}
          {detail.tags && detail.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                {detail.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600/30"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action 类型特有信息 */}
          {detail.finalType === 'action' && detail.actionExecution && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                执行信息
              </h3>
              <Card className="p-4 bg-slate-700/30 border-slate-600/30">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">实际开始</div>
                    <div className="text-sm text-green-400">
                      {detail.actionExecution.actualStart
                        ? dayjs(detail.actionExecution.actualStart).format('YYYY-MM-DD HH:mm')
                        : '未开始'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">实际结束</div>
                    <div className="text-sm text-amber-400">
                      {detail.actionExecution.actualEnd
                        ? dayjs(detail.actionExecution.actualEnd).format('YYYY-MM-DD HH:mm')
                        : '未结束'}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Memory 类型特有信息 */}
          {detail.finalType === 'memory' && (detail.memoryAids || detail.reviewSchedules) && (
            <div className="mb-6">
              <button
                onClick={() => setShowMemoryAids(!showMemoryAids)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-400 mb-3"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  记忆辅助
                </div>
                {showMemoryAids ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {showMemoryAids && (
                <div className="space-y-4">
                  {detail.memoryAids && (
                    <Card className="p-4 bg-slate-700/30 border-slate-600/30">
                      {detail.memoryAids.mindMapData && (
                        <div className="mb-3">
                          <div className="text-xs text-slate-500 mb-2">思维导图</div>
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                            {detail.memoryAids.mindMapData}
                          </pre>
                        </div>
                      )}
                      {detail.memoryAids.mnemonicsData && (
                        <div className="mb-3">
                          <div className="text-xs text-slate-500 mb-2">助记符</div>
                          <p className="text-sm text-slate-300">{detail.memoryAids.mnemonicsData}</p>
                        </div>
                      )}
                      {detail.memoryAids.sensoryData && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">感官联想</div>
                          <pre className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-800/50 p-3 rounded">
                            {detail.memoryAids.sensoryData}
                          </pre>
                        </div>
                      )}
                    </Card>
                  )}

                  {detail.reviewSchedules && detail.reviewSchedules.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 mb-2">复习计划</div>
                      <div className="space-y-2">
                        {detail.reviewSchedules.map(schedule => (
                          <Card key={schedule.id} className="p-3 bg-slate-700/30 border-slate-600/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {schedule.completed === 1 ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Clock className="w-4 h-4 text-slate-400" />
                                )}
                                <div>
                                  <div className="text-sm text-white">
                                    {dayjs(schedule.reviewDate).format('YYYY-MM-DD HH:mm')}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    第 {schedule.repetition + 1} 次复习 · 间隔 {schedule.intervalDays} 天
                                  </div>
                                </div>
                              </div>
                              <Badge variant={schedule.completed === 1 ? 'default' : 'outline'}>
                                {schedule.completed === 1 ? '已完成' : '待复习'}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 演化历程 */}
          {detail.stateLogs && detail.stateLogs.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                演化历程
              </h3>
              <div className="space-y-3">
                {detail.stateLogs.map((log, idx) => {
                  const triggerCfg = triggerTypeConfig[log.triggerType];
                  return (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-2 h-2 rounded-full ${triggerCfg.color}`} />
                        {idx < detail.stateLogs.length - 1 && (
                          <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-300">{log.description}</span>
                          <Badge variant="outline" className="text-xs">
                            {triggerCfg.label}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-500">
                          {log.fromStatus && (
                            <>
                              {statusConfig[log.fromStatus].label} →{' '}
                            </>
                          )}
                          {statusConfig[log.toStatus].label} · {formatRelativeTime(log.createTime)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI 分析历史 */}
          {detail.aiSnapshots && detail.aiSnapshots.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowAiSnapshots(!showAiSnapshots)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-400 mb-3"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI 分析历史 ({detail.aiSnapshots.length})
                </div>
                {showAiSnapshots ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {showAiSnapshots && (
                <div className="space-y-3">
                  {detail.aiSnapshots.map(snapshot => {
                    const result = parseAnalysisResult(snapshot.analysisResult);
                    return (
                      <Card key={snapshot.id} className="p-4 bg-slate-700/30 border-slate-600/30">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">{snapshot.analysisType}</span>
                              <Badge variant="outline" className="text-xs">{snapshot.aiModel}</Badge>
                              <Badge
                                variant={snapshot.status === 'success' ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {snapshot.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatRelativeTime(snapshot.createTime)} · 耗时 {snapshot.costTime}ms
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-2">分析结果</div>
                          {result.reasoning && (
                            <p className="text-sm text-slate-300 mb-2">{result.reasoning}</p>
                          )}
                          {result.confidence !== undefined && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-slate-500">置信度:</span>
                              <Progress value={result.confidence * 100} className="flex-1 h-1.5" />
                              <span className="text-xs text-cyan-400">{Math.round(result.confidence * 100)}%</span>
                            </div>
                          )}
                          {result.maturity !== undefined && (
                            <div className="text-xs text-slate-400">
                              成熟度: {result.maturity}
                            </div>
                          )}
                          {result.possible_final_types && (
                            <div className="text-xs text-slate-400 mt-1">
                              建议类型: {result.possible_final_types.map(t => finalTypeConfig[t].label).join(', ')}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-6 border-t border-slate-700">
            <Button variant="outline" className="flex-1 gap-2">
              <Edit className="w-4 h-4" />
              编辑杏仁
            </Button>
            <Button className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              开始复盘
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
