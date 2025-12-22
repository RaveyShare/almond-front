// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 杏仁项目类型
export interface AlmondItem {
  id: string;
  content: string;
  type: 'memory' | 'task' | 'goal';
  status: 'new' | 'understood' | 'evolving' | 'memorizing' | 'acting' | 'targeting' | 'reviewing' | 'completed';
  level: 'inbox' | 'today' | 'week' | 'month' | 'quarter' | 'year';
  priority: number;
  nextReviewDate?: string;
  memoryAids?: {
    mindMap?: any;
    mnemonics?: string[];
    sensoryAssociations?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页响应类型
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// 认证相关类型
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// 微信登录类型
export interface WechatLoginData {
  code: string;
  state?: string;
}

// 表单错误类型
export interface FormErrors {
  [key: string]: string;
}

// 组件Props类型
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// 布局Props类型
export interface LayoutProps extends ComponentProps {
  showBackground?: boolean;
}