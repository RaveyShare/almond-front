/**
 * 杏仁库相关的 TypeScript 类型定义
 */

// 杏仁状态
export type AlmondStatus = 'raw' | 'understood' | 'evolving' | 'converged' | 'archived';

// 杏仁终态类型
export type AlmondFinalType = 'memory' | 'action' | 'goal' | 'decision' | 'review';

// 触发类型
export type TriggerType = 'ai' | 'user' | 'system' | 'time';

// 标签类型
export type TagType = 'topic' | 'cognitive' | 'domain' | 'custom';

// 标签信息
export interface TagInfo {
  id: number;
  name: string;
  tagType: TagType;
}

// 状态日志
export interface StateLogInfo {
  id: number;
  fromStatus: AlmondStatus | null;
  toStatus: AlmondStatus;
  triggerType: TriggerType;
  triggerEvent: string | null;
  contextData: string;
  description: string;
  createTime: string;
}

// AI 快照
export interface AiSnapshotInfo {
  id: number;
  analysisType: string;
  aiModel: string;
  promptContent: string;
  analysisResult: string;
  status: string;
  costTime: number;
  createTime: string;
}

// AI 分析结果（解析后）
export interface AiAnalysisResult {
  maturity?: number;
  possible_final_types?: AlmondFinalType[];
  confidence?: number;
  reasoning?: string;
  [key: string]: any;
}

// 行动执行信息
export interface ActionExecutionInfo {
  actualStart: string | null;
  actualEnd: string | null;
}

// 记忆辅助信息
export interface MemoryAidsInfo {
  mindMapData: string | null;
  mnemonicsData: string | null;
  sensoryData: string | null;
}

// 复习计划
export interface ReviewScheduleInfo {
  id: number;
  reviewDate: string;
  completed: number;
  intervalDays: number;
  repetition: number;
  easiness: number;
}

// 列表项
export interface AlmondListItem {
  id: number;
  parentId: number | null;
  userId: number;
  title: string;
  content: string;
  clarifiedContent: string;
  almondStatus: AlmondStatus;
  finalType: AlmondFinalType | null;
  maturityScore: number;
  userFeedback: string | null;
  starred: number;
  priority: number;
  createTime: string;
  updateTime: string;
  tags: TagInfo[];
  actionInfo: any;
  latestStateLog: StateLogInfo;
  latestAiAnalysis: any;
}

// 详情数据
export interface AlmondDetail {
  id: number;
  parentId: number | null;
  userId: number;
  title: string;
  content: string;
  clarifiedContent: string;
  almondStatus: AlmondStatus;
  finalType: AlmondFinalType | null;
  maturityScore: number;
  evolutionStage: number;
  userFeedback: string | null;
  starred: number;
  priority: number;
  createTime: string;
  updateTime: string;
  tags: TagInfo[];
  stateLogs: StateLogInfo[];
  aiSnapshots: AiSnapshotInfo[];
  actionExecution?: ActionExecutionInfo;
  memoryAids?: MemoryAidsInfo;
  reviewSchedules?: ReviewScheduleInfo[];
}

// 统计信息
export interface AlmondStatistics {
  totalCount: number;
  statusCount: Record<AlmondStatus, number>;
  typeCount: Record<AlmondFinalType, number>;
  starredCount: number;
}

// 列表查询参数
export interface AlmondListParams {
  pageNum: number;
  pageSize: number;
  almondStatus?: AlmondStatus;
  finalType?: AlmondFinalType;
  starred?: 0 | 1;
  keyword?: string;
  sortBy?: 'update_time' | 'create_time' | 'maturity_score';
  sortOrder?: 'asc' | 'desc';
}

// 列表响应
export interface AlmondListResponse {
  total: number;
  list: AlmondListItem[];
  statistics: AlmondStatistics;
}

// 状态配置
export const statusConfig: Record<AlmondStatus, { label: string; emoji: string; color: string }> = {
  raw: { label: '新生', emoji: '🌱', color: 'from-slate-500/20 to-gray-500/20' },
  understood: { label: '待确认', emoji: '👀', color: 'from-blue-500/20 to-cyan-500/20' },
  evolving: { label: '演化中', emoji: '🔄', color: 'from-indigo-500/20 to-purple-500/20' },
  converged: { label: '已确认', emoji: '✨', color: 'from-emerald-500/20 to-teal-500/20' },
  archived: { label: '已完成', emoji: '🌰', color: 'from-amber-500/20 to-orange-500/20' }
};

// 类型配置
export const finalTypeConfig: Record<AlmondFinalType, { label: string; emoji: string; color: string; bgColor: string }> = {
  memory: { label: '记忆', emoji: '🧠', color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/30' },
  action: { label: '行动', emoji: '✅', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  goal: { label: '目标', emoji: '🎯', color: 'text-purple-400', bgColor: 'bg-purple-500/10 border-purple-500/30' },
  decision: { label: '决策', emoji: '🤔', color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/30' },
  review: { label: '复盘', emoji: '🪞', color: 'text-pink-400', bgColor: 'bg-pink-500/10 border-pink-500/30' }
};

// 触发类型配置
export const triggerTypeConfig: Record<TriggerType, { label: string; color: string }> = {
  ai: { label: 'AI', color: 'bg-blue-400' },
  user: { label: '用户', color: 'bg-green-400' },
  system: { label: '系统', color: 'bg-slate-400' },
  time: { label: '定时', color: 'bg-purple-400' }
};
