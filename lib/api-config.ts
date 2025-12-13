/**
 * API Configuration
 *
 * This file contains all API endpoints and request functions
 * to interact with the FastAPI backend.
 */

import { authManager, type AuthResponse, type LoginCredentials, type RegisterCredentials } from "./auth"
import type { MemoryItem, MemoryItemCreate, MemoryAids, ReviewSchedule, ReviewCompletionRequest, TaskItem, UnifiedItem } from "./types"
import { jwtDecode } from "jwt-decode";

// API Base URL 改为统一走 Almond 后端（Java）
const API_BASE_URL = (
  (process.env.NEXT_PUBLIC_ALMOND_BACK_URL ? `${process.env.NEXT_PUBLIC_ALMOND_BACK_URL.replace(/\/$/, '')}/api` : undefined)
  || "http://localhost:8000/api"
).replace(/\/$/, '')

// Almond-Back(Java) Base URL，默认本地 8083，可通过 NEXT_PUBLIC_ALMOND_BACK_URL 配置
const ALMOND_BACK_BASE_URL = (
  process.env.NEXT_PUBLIC_ALMOND_BACK_URL ||
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/(api|$)/, '') : undefined) ||
  "https://almond.ravey.site"
).replace(/\/$/, '')

// Java Front-Auth Base Path 走同源代理以避免跨域
const FRONT_AUTH_BASE_URL = ''

// 创建带超时的fetch函数
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
    }
    throw error;
  }
};

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// 统一处理 Java 后端 HttpResult 响应
function unwrapHttpResult<T>(res: { code: number; data: T; message?: string }): T {
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message || '服务错误')
  }
  return res.data
}

// API request functions
export const api = {
  frontAuth: {
    generateQr: async (appId: string, scene?: string): Promise<{ qrcodeId: string; expireAt: number; qrContent: string }> => {
      const response = await fetchWithTimeout(`/front/auth/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, scene }),
      }, 8000)
      const res = await handleResponse<{ code: number; data: { qrcodeId: string; expireAt: number; qrContent: string } }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('生成二维码失败')
      return res.data
    },
    generateWxacode: async (appId: string, qrcodeId: string, page = 'pages/auth/login/login', width = 430, envVersion: 'release' | 'trial' | 'develop' = 'release'): Promise<{ qrcodeId: string; expireAt: number; imageBase64: string }> => {
      const response = await fetchWithTimeout(`/front/auth/qr/wxacode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, qrcodeId, page, width, envVersion, checkPath: true }),
      }, 10000)
      const res = await handleResponse<{ code: number; data: { qrcodeId: string; expireAt: number; imageBase64: string } }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('生成小程序码失败')
      return res.data
    },
    checkQr: async (qrcodeId: string): Promise<{ status: number; token?: string; userInfo?: { id: string | number; nickname: string; avatarUrl?: string } }> => {
      const response = await fetchWithTimeout(`/front/auth/qr/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrcodeId }),
      }, 8000)
      const res = await handleResponse<{ code: number; data: { status: number; token?: string; userInfo?: { id: string | number; nickname: string; avatarUrl?: string } } }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('查询二维码状态失败')
      return res.data
    },
  },
  // Authentication endpoints
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      }, 8000);
      const data = await handleResponse<{ access_token: string }>(response);

      // Decode JWT to get user info
      const tokenPayload: { sub: string, email: string, full_name: string } = jwtDecode(data.access_token);
      const user = {
        id: tokenPayload.sub,
        email: tokenPayload.email,
        name: tokenPayload.full_name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tokenPayload.sub}`,
        createdAt: new Date().toISOString(),
      };

      const authData = { user, token: data.access_token, refreshToken: "" };
      authManager.setAuth(authData);
      return authData;
    },

    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          full_name: credentials.name,
        }),
      }, 8000);
      await handleResponse<any>(response);
      
      // After registration, log the user in to get a token
      return await api.auth.login(credentials);
    },

    logout: async (): Promise<void> => {
      authManager.clearAuth();
      return Promise.resolve();
    },

    forgotPassword: async (email: string): Promise<void> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      await handleResponse(response)
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword }),
      })
      await handleResponse(response)
    },

    // WeChat login endpoints
    wechatMiniLogin: async (code: string, userInfo?: any): Promise<AuthResponse> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/wechat/mini`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, user_info: userInfo }),
      }, 8000);
      const data = await handleResponse<{ access_token: string, user: any }>(response);

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name,
        avatar: data.user.wechat_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        createdAt: new Date().toISOString(),
      };

      const authData = { user, token: data.access_token, refreshToken: "" };
      authManager.setAuth(authData);
      return authData;
    },

    wechatMpLogin: async (code: string, state: string): Promise<AuthResponse> => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/wechat/mp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      }, 8000);
      const data = await handleResponse<{ access_token: string, user: any }>(response);

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.full_name,
        avatar: data.user.wechat_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}`,
        createdAt: new Date().toISOString(),
      };

      const authData = { user, token: data.access_token, refreshToken: "" };
      authManager.setAuth(authData);
      return authData;
    },
  },

  // Memory items endpoints
  getMemoryItems: async (params?: { keyword?: string; category?: string; page?: number; size?: number }): Promise<UnifiedItem[]> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const query = new URLSearchParams()
    if (params?.keyword) query.set('keyword', params.keyword)
    if (params?.category) query.set('category', params.category)
    query.set('page', String(params?.page ?? 1))
    query.set('size', String(params?.size ?? 20))

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/list?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 15000)
    const res = await handleResponse<{ code: number; data: { total: number; page: number; size: number; list: any[] } }>(response)
    const pageData = unwrapHttpResult(res)
    return (pageData.list || []).map((dto: any): MemoryItem => ({
      id: String(dto.id),
      user_id: String(dto.userId) as any,
      created_at: dto.createTime ? new Date(dto.createTime).toISOString() : new Date().toISOString(),
      title: dto.title || '',
      content: dto.content || '',
      tags: typeof dto.tags === 'string' ? dto.tags.split(',').filter(Boolean) : Array.isArray(dto.tags) ? dto.tags : [],
      category: dto.category || 'general',
      difficulty: (dto.difficulty || 'medium'),
      mastery: Number(dto.mastery ?? 0),
      reviewCount: Number(dto.reviewCount ?? 0),
      starred: dto.starred === 1 || dto.starred === true,
      next_review_date: dto.nextReviewDate ? new Date(dto.nextReviewDate).toISOString() : null,
      type: 'memory',
      status: 'new'
    }))
  },

  getMemoryItem: async (id: string): Promise<UnifiedItem> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 15000)
    const res = await handleResponse<{ code: number; data: any }>(response)
    const dto = unwrapHttpResult(res)
    return {
      id: String(dto.id),
      user_id: String(dto.userId) as any,
      created_at: dto.createTime ? new Date(dto.createTime).toISOString() : new Date().toISOString(),
      title: dto.title || '',
      content: dto.content || '',
      tags: typeof dto.tags === 'string' ? dto.tags.split(',').filter(Boolean) : Array.isArray(dto.tags) ? dto.tags : [],
      category: dto.category || 'general',
      difficulty: (dto.difficulty || 'medium'),
      mastery: Number(dto.mastery ?? 0),
      reviewCount: Number(dto.reviewCount ?? 0),
      starred: dto.starred === 1 || dto.starred === true,
      next_review_date: dto.nextReviewDate ? new Date(dto.nextReviewDate).toISOString() : null,
      type: 'memory',
      status: 'new'
    }
  },

  saveMemoryItem: async (item: MemoryItemCreate): Promise<MemoryItem> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const payload = {
      title: item.content?.slice(0, 50) || '未命名',
      content: item.content,
      tags: Array.isArray(item.memory_aids?.mnemonics) ? item.memory_aids!.mnemonics.map(m => m.title).join(',') : '',
      category: 'general',
      itemType: 'text',
      difficulty: 'medium',
      starred: 0,
    }

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }, 8000)
    const res = await handleResponse<{ code: number; data: any }>(response)
    const dto = unwrapHttpResult(res)
    return {
      id: String(dto.id),
      user_id: String(dto.userId) as any,
      created_at: dto.createTime ? new Date(dto.createTime).toISOString() : new Date().toISOString(),
      title: dto.title || '',
      content: dto.content || '',
      tags: typeof dto.tags === 'string' ? dto.tags.split(',').filter(Boolean) : Array.isArray(dto.tags) ? dto.tags : [],
      category: dto.category || 'general',
      difficulty: (dto.difficulty || 'medium'),
      mastery: Number(dto.mastery ?? 0),
      reviewCount: Number(dto.reviewCount ?? 0),
      starred: dto.starred === 1 || dto.starred === true,
      next_review_date: dto.nextReviewDate ? new Date(dto.nextReviewDate).toISOString() : null,
      type: 'memory',
      status: 'new'
    }
  },

  updateMemoryItem: async (itemId: string, updates: Partial<MemoryItem>): Promise<MemoryItem> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const payload: any = { id: Number(itemId) }
    if (updates.title !== undefined) payload.title = updates.title
    if (updates.content !== undefined) payload.content = updates.content
    if (updates.category !== undefined) payload.category = updates.category
    if (updates.tags !== undefined) payload.tags = Array.isArray(updates.tags) ? updates.tags.join(',') : String(updates.tags || '')
    if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty
    if (updates.mastery !== undefined) payload.mastery = updates.mastery
    if (updates.reviewCount !== undefined) payload.reviewCount = updates.reviewCount
    if (updates.starred !== undefined) payload.starred = updates.starred ? 1 : 0

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }, 8000);
    const res = await handleResponse<{ code: number; data: any }>(response)
    const dto = unwrapHttpResult(res)
    return {
      id: String(dto.id),
      user_id: String(dto.userId) as any,
      created_at: new Date().toISOString(),
      title: dto.title || '',
      content: dto.content || '',
      tags: typeof dto.tags === 'string' ? dto.tags.split(',').filter(Boolean) : Array.isArray(dto.tags) ? dto.tags : [],
      category: dto.category || 'general',
      difficulty: (dto.difficulty || 'medium'),
      mastery: Number(dto.mastery ?? 0),
      reviewCount: Number(dto.reviewCount ?? 0),
      starred: dto.starred === 1 || dto.starred === true,
      next_review_date: dto.nextReviewDate ? new Date(dto.nextReviewDate).toISOString() : null,
      type: 'memory',
      status: 'new'
    }
  },

  updateMemoryItemAids: async (_itemId: string, _aids: MemoryAids): Promise<MemoryItem> => {
    throw new Error('暂不支持更新记忆辅助，请先接入后端字段')
  },

  // Review schedules endpoints
  getReviewSchedules: async (memoryItemId: string): Promise<ReviewSchedule[]> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${API_BASE_URL}/review_schedules?memory_item_id=${memoryItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 15000);
    return handleResponse<ReviewSchedule[]>(response);
  },

  completeReview: async (scheduleId: string, reviewData: ReviewCompletionRequest): Promise<MemoryItem> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${API_BASE_URL}/review_schedules/${scheduleId}/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    }, 8000);
    return handleResponse<MemoryItem>(response);
  },

  // Memory aids generation
  generateMemoryAids: async (content: string): Promise<MemoryAids> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${API_BASE_URL}/memory/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    }, 60000)
    return handleResponse<MemoryAids>(response)
  },

  deleteMemoryItem: async (id: string): Promise<void> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/delete/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 5000)

    const res = await handleResponse<{ code: number; data: boolean }>(response)
    const ok = unwrapHttpResult(res)
    if (!ok) throw new Error('删除失败')
    return
  },

  // Plans endpoints
  getPlans: async (level: string): Promise<any[]> => {
    // Placeholder: 等待后端接入
    return Promise.resolve([])
  },
  
  createPlan: async (plan: any): Promise<any> => {
     // Placeholder
     return Promise.resolve({
       id: Date.now().toString(),
       title: plan.title,
       status: 'todo',
       created_at: new Date().toISOString()
     })
  },

  createTask: async (title: string): Promise<TaskItem> => {
     // Placeholder
     return Promise.resolve({
       id: Date.now().toString(),
       user_id: '00000000-0000-0000-0000-000000000000' as any,
       title: title,
       content: '',
       tags: [],
       type: 'task',
       status: 'todo',
       created_at: new Date().toISOString()
     })
  },

  // Reviews endpoints
  getReviews: async (level: string): Promise<any[]> => {
    // Placeholder: 等待后端接入
    return Promise.resolve([])
  },
  
  createReview: async (review: any): Promise<any> => {
     // Placeholder
     return Promise.resolve({})
  },

  // Media generation endpoints
  generateImage: async (content: string, context: string = ""): Promise<{prompt: string, image_url?: string, image_base64?: string, status: string}> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${API_BASE_URL}/generate/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, context }),
    }, 15000)
    return handleResponse<{prompt: string, image_url?: string, image_base64?: string, status: string}>(response)
  },

  generateAudio: async (content: string, context: string = ""): Promise<{script: string, audio_base64?: string, duration?: number, sound_description?: string, sound_type?: string, message?: string, status: string}> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${API_BASE_URL}/generate/audio`, {
    method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, context }),
    }, 15000)
    return handleResponse<{script: string, audio_base64?: string, duration?: number, status: string}>(response)
  },

}

export default api
