/**
 * 杏仁库 API 服务
 */

import { authManager } from './auth';
import type {
  AlmondListParams,
  AlmondListResponse,
  AlmondDetail
} from './almond-types';

// API 基础 URL
const ALMOND_BACK_BASE_URL = (
  process.env.NEXT_PUBLIC_ALMOND_BACK_URL || "http://localhost:8082"
).replace(/\/$/, '');

// 创建带超时的 fetch 函数
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

// 处理 API 响应
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// 统一处理 Java 后端 HttpResult 响应
function unwrapHttpResult<T>(res: { code: number; data: T; message?: string }): T {
  if (res.code !== 0 && res.code !== 200) {
    throw new Error(res.message || '服务错误');
  }
  return res.data;
}

export const almondApi = {
  /**
   * 获取杏仁库列表
   */
  getAlmondList: async (params: AlmondListParams): Promise<AlmondListResponse> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/almonds/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    }, 15000);

    const res = await handleResponse<{ code: number; data: AlmondListResponse; message?: string }>(response);
    return unwrapHttpResult(res);
  },

  /**
   * 获取杏仁详情
   */
  getAlmondDetail: async (id: string | number): Promise<AlmondDetail> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/almonds/${id}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }, 15000);

    const res = await handleResponse<{ code: number; data: AlmondDetail; message?: string }>(response);
    return unwrapHttpResult(res);
  },

  /**
   * 切换杏仁星标状态
   */
  toggleAlmondStar: async (id: string | number, starred: boolean): Promise<void> => {
    const token = authManager.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetchWithTimeout(`${ALMOND_BACK_BASE_URL}/front/almonds/${id}/star`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ starred: starred ? 1 : 0 }),
    }, 8000);

    const res = await handleResponse<{ code: number; message?: string }>(response);
    if (res.code !== 0 && res.code !== 200) {
      throw new Error(res.message || '操作失败');
    }
  },
};

export default almondApi;
