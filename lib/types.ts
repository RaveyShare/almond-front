import type { UUID } from "crypto";

export interface User {
  id: UUID;
  email: string;
  full_name?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface KeyPrinciple {
  concept: string;
  example: string;
}

export interface MemoryScene {
  principle: string;
  scene: string;
  anchor: string;
}

export interface Mnemonic {
  id: string;
  title: string;
  content: string;
  type: string;
  explanation?: string;
  corePoint?: string;
  keyPrinciples?: KeyPrinciple[];
  theme?: string;
  scenes?: MemoryScene[];
}

export interface VisualAssociation {
  dynasty: string;
  image: string;
  color: string;
  association: string;
}

export interface AuditoryAssociation {
  dynasty: string;
  sound: string;
  rhythm: string;
}

export interface TactileAssociation {
  dynasty: string;
  texture: string;
  feeling: string;
}

export type SensoryAssociationContent = VisualAssociation[] | AuditoryAssociation[] | TactileAssociation[];

export interface SensoryAssociation {
  id: string;
  title: string;
  type: string;
  content: SensoryAssociationContent;
}

export interface MemoryAids {
  mindMap: MindMapNode;
  mnemonics: Mnemonic[];
  sensoryAssociations: SensoryAssociation[];
}

// Unified Item Type
export type ItemType = 'memory' | 'task' | 'plan';
export type ItemStatus = 'todo' | 'doing' | 'done' | 'archived' | 'new' | 'reviewing' | 'mastered';

export interface BaseItem {
  id: string;
  user_id: UUID;
  created_at: string;
  title: string;
  content: string;
  tags: string[];
  type: ItemType;
  status: ItemStatus;
  priority?: number;
}

export interface MemoryItem extends BaseItem {
  type: 'memory';
  memory_aids?: MemoryAids;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastery: number;
  reviewCount: number;
  starred: boolean;
  next_review_date?: string | null;
}

export interface TaskItem extends BaseItem {
  type: 'task';
  start_date?: string;
  end_date?: string;
  actual_start?: string;
  actual_end?: string;
  parent_id?: string;
}

export type UnifiedItem = MemoryItem | TaskItem;

// 杏仁概念统一类型
export type AlmondType = 'almond' | 'task' | 'memory' | 'goal';
export type AlmondItemType = 'general' | 'qa' | 'flashcard' | 'experience' | 'reflection';
export type AlmondLevel = 'year' | 'quarter' | 'month' | 'week' | 'day' | 'inbox';

export interface AlmondItem {
  // 基础信息
  id: string;
  user_id: UUID;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  
  // 杏仁类型 (对应后端的task_type)
  almondType: AlmondType;
  
  // 详细类型 (对应后端的item_type)
  itemType: AlmondItemType;
  
  // 层级维度
  level: AlmondLevel;
  
  // 分类和标签
  category: string;
  tags: string[];
  
  // 状态管理
  status: ItemStatus;
  priority: number;
  starred: boolean;
  order_index?: number;
  
  // 记忆相关字段
  difficulty?: 'easy' | 'medium' | 'hard';
  mastery?: number; // 0-100
  reviewCount?: number;
  review_date?: string | null;
  next_review_date?: string | null;
  
  // 时间安排
  start_date?: string | null;
  end_date?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  
  // 层级关系
  parent_id?: string | null;
  
  // 扩展字段
  metadata?: Record<string, any>;
  
  // 记忆辅助工具
  memory_aids?: MemoryAids;
}

export interface MemoryItemCreate {
  content: string;
  memory_aids: MemoryAids;
}

export interface ReviewSchedule {
  id: string;
  memory_item_id: string;
  user_id: UUID;
  review_date: string;
  interval_days: number;
  repetition: number;
  easiness_factor: number;
  completed: boolean;
  created_at: string;
}

export interface ReviewCompletionRequest {
  mastery: number; // 0-100 percentage
  difficulty: string; // 'easy' | 'medium' | 'hard'
}

export interface DecomposeResult {
  subtasks: { title: string; description?: string }[];
}
