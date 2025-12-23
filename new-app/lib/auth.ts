import { User, AuthResponse } from '../types';

const STORAGE_KEYS = {
  TOKEN: 'almond_token',
  USER: 'almond_user',
  REFRESH_TOKEN: 'almond_refresh_token',
};

class AuthManager {
  private token: string | null = null;
  private user: User | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        this.clearStorage();
      }
    }
  }

  saveToStorage(response: AuthResponse) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.userInfo));
    if (response.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    }
  }

  private clearStorage() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  updateUser(user: User): void {
    this.user = user;
    if (this.token) {
      this.saveToStorage({
        token: this.token,
        userInfo: user,
        refreshToken: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || undefined : undefined
      });
    }
    this.notifyListeners();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`/api/user-center/front/auth/email/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, loginType: 1 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '登录失败');
      }

      const res = await response.json();
      // Handle potential wrapper structure (e.g. { code: 200, data: { ... } })
      const data: AuthResponse = res.data || res;
      
      if (!data.token || !data.userInfo) {
        console.error('Invalid auth response format:', res);
        throw new Error('登录响应格式错误');
      }

      this.token = data.token;
      this.user = data.userInfo;
      this.saveToStorage(data);
      this.notifyListeners();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async sendVerificationCode(email: string, scene: number = 1): Promise<void> {
    try {
      const response = await fetch(`/api/user-center/front/auth/email/sendCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, scene }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '发送验证码失败');
      }

      const res = await response.json();
      if (res.code && res.code !== 200) {
        throw new Error(res.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('Send code error:', error);
      throw error;
    }
  }

  async register(username: string, email: string, password: string, code: string): Promise<void> {
    try {
      const response = await fetch(`/api/user-center/front/auth/email/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: username, email, password, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '注册失败');
      }

      const res = await response.json();
      // Handle potential wrapper structure
      const data: AuthResponse = res.data || res;

      if (!data.token || !data.userInfo) {
        console.error('Invalid auth response format:', res);
        throw new Error('注册响应格式错误');
      }

      this.token = data.token;
      this.user = data.userInfo;
      this.saveToStorage(data);
      this.notifyListeners();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async wechatLogin(code: string): Promise<void> {
    try {
      const response = await fetch(`/api/user-center/front/auth/wechat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '微信登录失败');
      }

      const res = await response.json();
      // Handle potential wrapper structure
      const data: AuthResponse = res.data || res;

      if (!data.token || !data.userInfo) {
        console.error('Invalid auth response format:', res);
        throw new Error('微信登录响应格式错误');
      }

      this.token = data.token;
      this.user = data.userInfo;
      this.saveToStorage(data);
      this.notifyListeners();
    } catch (error) {
      console.error('WeChat login error:', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    this.clearStorage();
    this.notifyListeners();
  }

  addListener(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  removeListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
}

export const authManager = new AuthManager();
