import { authManager } from './auth'

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

// API request functions for QR code login
// 统一使用 /api/user-center 前缀，与其他API保持一致
export const qrApi = {
  // 生成二维码ID
  generateQr: async (appId: string, scene?: string): Promise<{ qrcodeId: string; expireAt: number; qrContent: string }> => {
    const response = await fetchWithTimeout(`/api/user-center/front/auth/qr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, scene }),
    }, 8000)
    const res = await handleResponse<{ code: number; data: { qrcodeId: string; expireAt: number; qrContent: string } }>(response)
    if (res.code !== 0 && res.code !== 200) throw new Error('生成二维码失败')
    return res.data
  },

  // 生成小程序码图片
  generateWxacode: async (
    appId: string,
    qrcodeId: string,
    page = 'pages/auth/login/login',
    width = 430,
    envVersion: 'release' | 'trial' | 'develop' = 'release'
  ): Promise<{ qrcodeId: string; expireAt: number; imageBase64: string }> => {
    const response = await fetchWithTimeout(`/api/user-center/front/auth/qr/wxacode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId, qrcodeId, page, width, envVersion, checkPath: true }),
    }, 10000)
    const res = await handleResponse<{ code: number; data: { qrcodeId: string; expireAt: number; imageBase64: string } }>(response)
    if (res.code !== 0 && res.code !== 200) throw new Error('生成小程序码失败')
    return res.data
  },

  // 检查二维码扫码状态
  checkQr: async (qrcodeId: string): Promise<{
    status: number;
    token?: string;
    userInfo?: { id: string | number; nickname: string; avatarUrl?: string }
  }> => {
    const response = await fetchWithTimeout(`/api/user-center/front/auth/qr/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrcodeId }),
    }, 8000)
    const res = await handleResponse<{
      code: number;
      data: {
        status: number;
        token?: string;
        userInfo?: { id: string | number; nickname: string; avatarUrl?: string }
      }
    }>(response)
    if (res.code !== 0 && res.code !== 200) throw new Error('查询二维码状态失败')
    return res.data
  },
};

export const authApi = {
  // 发送重置密码验证码
  sendResetCode: async (email: string): Promise<void> => {
    const response = await fetchWithTimeout(`/api/user-center/front/auth/email/sendCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, scene: 3 }),
    })
    const res = await handleResponse<{ code: number; message?: string }>(response)
    if (res.code !== 0 && res.code !== 200) {
        throw new Error(res.message || '发送验证码失败')
    }
  },

  // 重置密码
  resetPassword: async (email: string, newPassword: string, code: string): Promise<void> => {
    const response = await fetchWithTimeout(`/api/user-center/front/auth/email/resetPassword`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword, code }),
    })
    const res = await handleResponse<{ code: number; message?: string }>(response)
    if (res.code !== 0 && res.code !== 200) {
        throw new Error(res.message || '重置密码失败')
    }
  }
};

export const api = {
  qr: qrApi,
  auth: authApi,
  almonds: {
    list: async (params?: { status?: string; pageNo?: number; pageSize?: number }): Promise<{ total: number; pageNo: number; pageSize: number; pages: number; data: import('../types').Almond[] }> => {
      const token = authManager.getToken()
      if (!token) throw new Error('未登录')
      const query = new URLSearchParams()
      if (params?.status) query.set('status', params.status)
      query.set('pageNo', String(params?.pageNo ?? 1))
      query.set('pageSize', String(params?.pageSize ?? 10))
      const response = await fetchWithTimeout(`/api/almond-back/almonds?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, 15000)
      const res = await handleResponse<{ code: number; data: import('../types').PageResp<import('../types').Almond> }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('查询失败')
      return res.data
    },
    create: async (payload: { title: string; description?: string; level?: string; startDate?: string; endDate?: string; priority?: number; tags?: string[] }): Promise<number> => {
      const token = authManager.getToken()
      if (!token) throw new Error('未登录')
      const body = {
        title: payload.title,
        description: payload.description || payload.title,
        level: payload.level || 'inbox',
        startDate: payload.startDate || '',
        endDate: payload.endDate || '',
        priority: typeof payload.priority === 'number' ? payload.priority : 0,
        tags: JSON.stringify(payload.tags || [])
      }
      const response = await fetchWithTimeout(`/api/almond-back/almonds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }, 10000)
      const res = await handleResponse<{ code: number; data: number }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('创建失败')
      return res.data
    },
    get: async (id: number): Promise<import('../types').Almond> => {
      const token = authManager.getToken()
      if (!token) throw new Error('未登录')
      const response = await fetchWithTimeout(`/api/almond-back/almonds/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }, 10000)
      const res = await handleResponse<{ code: number; data: import('../types').Almond }>(response)
      if (res.code !== 0 && res.code !== 200) throw new Error('查询失败')
      return res.data
    }
  }
};
