/**
 * API Configuration for QR Code Login
 */

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
