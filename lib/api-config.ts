/**
 * API Configuration
 *
 * This file contains all API endpoints and request functions
 * to interact with the FastAPI backend.
 */

import { authManager, type AuthResponse, type LoginCredentials, type RegisterCredentials } from "./auth"
import type { MemoryItem, MemoryItemCreate, MemoryAids, ReviewSchedule, ReviewCompletionRequest, TaskItem, UnifiedItem } from "./types"
import { jwtDecode } from "jwt-decode";

// Almond-Back(Java) Base URL
const ALMOND_BACK_BASE_URL = (
  process.env.NEXT_PUBLIC_ALMOND_BACK_URL || "http://localhost:8082"
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
// We will define specific method objects first to avoid circular type inference
const frontAuthMethods = {
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
}

// Define Authentication endpoints separately to avoid circular reference in type inference
const authMethods = {
  // Email Authentication
  sendCode: async (email: string, scene: number): Promise<void> => {
    const response = await fetchWithTimeout(`/front/auth/email/sendCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, scene }),
    }, 8000)
    const res = await handleResponse<{ code: number; message: string }>(response)
    if (res.code !== 200 && res.code !== 0) throw new Error(res.message || '发送失败')

    // 检查是否有错误消息
    if (res.message && res.message.includes('失败')) {
      throw new Error(res.message)
    }
  },

  emailRegister: async (data: RegisterCredentials & { code: string }): Promise<AuthResponse> => {
    const response = await fetchWithTimeout(`/front/auth/email/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        code: data.code,
        nickname: data.name,
      }),
    }, 8000)
    const res = await handleResponse<{ code: number; data: any; message: string }>(response)
    if (res.code !== 200 && res.code !== 0) throw new Error(res.message || '注册失败')

    // 兼容后端返回对象或纯字符串的情况
    const regData = res.data
    const token = typeof regData === 'string' ? regData : regData.token

    if (!token) {
      throw new Error(res.message || '注册失败：未获取到有效 Token')
    }

    const tokenPayload: any = jwtDecode(token)

    // 优先使用后端返回的用户信息
    let user;
    if (regData.userInfo) {
      const u = regData.userInfo
      user = {
        id: String(u.id),
        email: u.email || data.email,
        name: u.nickname || data.name,
        avatar: u.avatarUrl || 'https://oss.ravey.site/almond.png',
        createdAt: new Date().toISOString(),
      }
    } else {
      user = {
        id: tokenPayload.sub || tokenPayload.userId,
        email: data.email,
        name: data.name,
        avatar: 'https://oss.ravey.site/almond.png',
        createdAt: new Date().toISOString(),
      }
    }

    const authData = { user, token, refreshToken: "" }
    authManager.setAuth(authData)
    return authData
  },

  emailLogin: async (data: LoginCredentials & { code?: string; loginType: number }): Promise<AuthResponse> => {
    const response = await fetchWithTimeout(`/front/auth/email/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        code: data.code || "",
        loginType: data.loginType,
      }),
    }, 8000)
    const res = await handleResponse<{ code: number; data: any; message: string }>(response)
    if (res.code !== 200 && res.code !== 0) throw new Error(res.message || '登录失败')

    const loginData = res.data
    const token = typeof loginData === 'string' ? loginData : loginData.token

    if (!token) {
      throw new Error(res.message || '登录失败：未获取到 Token')
    }

    const tokenPayload: any = jwtDecode(token)

    // 如果后端直接返回了用户信息，直接使用，不再请求 /me
    if (loginData.userInfo) {
      const u = loginData.userInfo
      const user = {
        id: String(u.id),
        email: u.email || data.email,
        name: u.nickname || u.email,
        avatar: u.avatarUrl || 'https://oss.ravey.site/almond.png',
        createdAt: new Date().toISOString(),
      }
      const authData = { user, token, refreshToken: "" }
      authManager.setAuth(authData)
      return authData
    }

    // 兼容旧逻辑：如果没返回 userInfo，尝试请求 /me 或使用 payload 兜底
    try {
      const userRes = await fetchWithTimeout(`/front/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = await handleResponse<{ code: number; data: any }>(userRes)
      const detailedUser = unwrapHttpResult(userData)
      const user = {
        id: String(detailedUser.id),
        email: detailedUser.email || data.email,
        name: detailedUser.nickname || detailedUser.username || detailedUser.email,
        avatar: detailedUser.avatarUrl || 'https://oss.ravey.site/almond.png',
        createdAt: detailedUser.createdAt || new Date().toISOString(),
      }
      const authData = { user, token, refreshToken: "" }
      authManager.setAuth(authData)
      return authData
    } catch (e) {
      const user = {
        id: tokenPayload.sub || tokenPayload.userId,
        email: data.email,
        name: data.email.split('@')[0],
        avatar: 'https://oss.ravey.site/almond.png',
        createdAt: new Date().toISOString(),
      }
      const authData = { user, token, refreshToken: "" }
      authManager.setAuth(authData)
      return authData
    }
  },

  emailResetPassword: async (data: { email: string; newPassword: string; code: string }): Promise<void> => {
    const response = await fetchWithTimeout(`/front/auth/email/resetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        newPassword: data.newPassword,
        code: data.code,
      }),
    }, 8000)
    const res = await handleResponse<{ code: number; message: string }>(response)
    if (res.code !== 200 && res.code !== 0) throw new Error(res.message || '重置失败')
  },

  // Legacy or generic login/register (mapping to new ones if possible)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return authMethods.emailLogin({ ...credentials, loginType: 1 })
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    throw new Error('Please use emailRegister with verification code')
  },

  logout: async (): Promise<void> => {
    authManager.clearAuth();
    return Promise.resolve();
  },

  forgotPassword: async (email: string): Promise<void> => {
    return authMethods.sendCode(email, 3) // 3 is reset password scene
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    throw new Error('Please use emailResetPassword with email and verification code')
  },

  // WeChat login endpoints
  wechatMiniLogin: async (code: string, userInfo?: any): Promise<AuthResponse> => {
    const response = await fetchWithTimeout(`/front/auth/wechat/mini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, user_info: userInfo }),
    }, 8000);
    const data = await handleResponse<{ access_token: string, user: any }>(response);

    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.full_name,
      avatar: data.user.wechat_avatar || 'https://oss.ravey.site/almond.png',
      createdAt: new Date().toISOString(),
    };

    const authData = { user, token: data.access_token, refreshToken: "" };
    authManager.setAuth(authData);
    return authData;
  },

  wechatMpLogin: async (code: string, state: string): Promise<AuthResponse> => {
    const response = await fetchWithTimeout(`/front/auth/wechat/mp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, state }),
    }, 8000);
    const data = await handleResponse<{ access_token: string, user: any }>(response);

    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.full_name,
      avatar: data.user.wechat_avatar || 'https://oss.ravey.site/almond.png',
      createdAt: new Date().toISOString(),
    };

    const authData = { user, token: data.access_token, refreshToken: "" };
    authManager.setAuth(authData);
    return authData;
  },
}

export const api = {
  frontAuth: frontAuthMethods,
  auth: authMethods,
  user: {
    getCurrentUser: async (): Promise<any> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const response = await fetchWithTimeout(`/front/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }, 8000)
      const res = await handleResponse<{ code: number; data: any }>(response)
      return unwrapHttpResult(res)
    },

    updateProfile: async (data: { nickname: string; avatarUrl: string }): Promise<any> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const response = await fetchWithTimeout(`/front/users/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }, 8000)
      const res = await handleResponse<{ code: number; data: any }>(response)
      return unwrapHttpResult(res)
    },

    uploadAvatar: async (file: File): Promise<string> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetchWithTimeout(`/front/users/avatar/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }, 30000)
      const res = await handleResponse<{ code: number; data: string }>(response)
      return unwrapHttpResult(res)
    }
  },

  // Memory items endpoints
  getMemoryItems: async (params?: { keyword?: string; category?: string; page?: number; size?: number }): Promise<MemoryItem[]> => {
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

  getMemoryItem: async (id: string): Promise<MemoryItem> => {
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
      tags: Array.isArray(item.memory_aids?.mnemonics) ? item.memory_aids!.mnemonics.map(m => m.title) : [],
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
    const id = unwrapHttpResult(res)

    // 返回临时构建的对象，ID使用后端返回的
    return {
      id: String(id),
      user_id: '' as any,
      created_at: new Date().toISOString(),
      title: payload.title,
      content: payload.content || '',
      tags: typeof payload.tags === 'string' ? [] : payload.tags,
      category: payload.category,
      difficulty: payload.difficulty as 'medium',
      mastery: 0,
      reviewCount: 0,
      starred: false,
      next_review_date: null,
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
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.difficulty !== undefined) payload.difficulty = updates.difficulty
    if (updates.mastery !== undefined) payload.mastery = updates.mastery
    if (updates.reviewCount !== undefined) payload.reviewCount = updates.reviewCount
    if (updates.starred !== undefined) payload.starred = updates.starred ? 1 : 0
    if (updates.next_review_date !== undefined) payload.nextReviewDate = updates.next_review_date

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/memory/items/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }, 8000);
    const res = await handleResponse<{ code: number; data: boolean }>(response)
    const success = unwrapHttpResult(res)

    if (!success) {
      throw new Error('Update failed');
    }

    // Since the backend only returns a boolean, we construct the updated item from the original/updates
    // In a real scenario, we might want to fetch the updated item or just return what we sent
    return {
      id: itemId,
      ...updates,
    } as MemoryItem
  },

  updateMemoryItemAids: async (_itemId: string, _aids: MemoryAids): Promise<MemoryItem> => {
    throw new Error('暂不支持更新记忆辅助，请先接入后端字段')
  },

  // Review schedules endpoints
  getReviewSchedules: async (memoryItemId: string): Promise<ReviewSchedule[]> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/review_schedules?memory_item_id=${memoryItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 15000);
    return handleResponse<ReviewSchedule[]>(response);
  },

  completeReview: async (scheduleId: string, reviewData: ReviewCompletionRequest): Promise<MemoryItem> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/review_schedules/${scheduleId}/complete`, {
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

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/memory/generate`, {
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

  tasks: {
    create: async (title: string): Promise<TaskItem> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/tasks/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          status: 'todo',
          priority: 0,
          level: 'inbox'
        }),
      }, 8000)

      const res = await handleResponse<{ code: number; data: number }>(response)
      const id = unwrapHttpResult(res)

      return {
        id: String(id),
        user_id: '' as any, // 暂不返回userId
        title: title,
        content: '',
        tags: [],
        type: 'task',
        status: 'todo',
        created_at: new Date().toISOString()
      }
    },

    decompose: async (id: string): Promise<string> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/tasks/${id}/decompose`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, 30000)

      const res = await handleResponse<{ code: number; data: string }>(response)
      return unwrapHttpResult(res)
    },

    generateMemoryAids: async (id: string): Promise<string> => {
      const token = authManager.getToken()
      if (!token) throw new Error("Not authenticated")

      const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/tasks/${id}/generate-memory-aids`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }, 30000)

      const res = await handleResponse<{ code: number; data: string }>(response)
      return unwrapHttpResult(res)
    },
  },

  // 向后兼容旧的 createTask
  createTask: async (title: string): Promise<TaskItem> => {
    return api.tasks.create(title)
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
  generateImage: async (content: string, context: string = ""): Promise<{ prompt: string, image_url?: string, image_base64?: string, status: string }> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/generate/image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, context }),
    }, 15000)
    return handleResponse<{ prompt: string, image_url?: string, image_base64?: string, status: string }>(response)
  },

  generateAudio: async (content: string, context: string = ""): Promise<{ script: string, audio_base64?: string, duration?: number, sound_description?: string, sound_type?: string, message?: string, status: string }> => {
    const token = authManager.getToken()
    if (!token) throw new Error("Not authenticated")

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/generate/audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, context }),
    }, 15000)
    return handleResponse<{ script: string, audio_base64?: string, duration?: number, status: string }>(response)
  },

}

export default api
