/**
 * 错误处理工具函数
 * 将后端业务异常转换为用户友好的提示信息
 * @author ravey
 */

/**
 * 业务错误映射表
 * 将后端错误消息映射为用户友好的提示
 */
const BUSINESS_ERROR_MAP: Record<string, { title: string; description: string }> = {
  // 用户认证相关
  '该邮箱已注册': {
    title: '邮箱已被注册',
    description: '该邮箱地址已经注册过账户，请直接登录或找回密码'
  },
  '用户不存在': {
    title: '账户不存在',
    description: '请输入正确的邮箱地址，或先注册新账户'
  },
  '密码错误': {
    title: '密码错误',
    description: '请输入正确的密码，或找回密码'
  },
  '未登录': {
    title: '请先登录',
    description: '您需要登录后才能继续使用'
  },
  '用户ID不能为空': {
    title: '参数错误',
    description: '请求参数不完整，请检查后重试'
  },
  '不支持的登录方式': {
    title: '登录方式不支持',
    description: '请选择支持的登录方式'
  },

  // 验证码相关
  '验证码错误或已过期': {
    title: '验证码错误',
    description: '验证码输入错误或已过期，请重新获取验证码'
  },
  '邮箱不能为空': {
    title: '邮箱不能为空',
    description: '请输入有效的邮箱地址'
  },

  // 文件上传相关
  '文件不能为空': {
    title: '请选择文件',
    description: '请先选择要上传的文件'
  },
  '文件上传失败': {
    title: '上传失败',
    description: '文件上传失败，请检查网络连接后重试'
  },

  // 二维码登录相关
  '二维码不存在': {
    title: '二维码失效',
    description: '二维码已失效，请刷新页面重新生成'
  },
  '二维码已过期': {
    title: '二维码已过期',
    description: '二维码已过期，请刷新页面重新生成'
  },

  // 邮件发送相关
  '邮件发送失败': {
    title: '邮件发送失败',
    description: '邮件发送失败，请稍后重试或检查邮箱地址是否正确'
  },

  // HTTP访问异常
  'HTTP访问超时': {
    title: '网络连接超时',
    description: '网络连接超时，请检查网络后重试'
  },
  'HTTP访问出错': {
    title: '网络访问出错',
    description: '网络访问出错，请检查网络连接'
  }
}

/**
 * 系统错误映射表
 * 通用系统错误的友好提示
 */
const SYSTEM_ERROR_MAP: Record<string, { title: string; description: string }> = {
  'NetworkError': {
    title: '网络连接失败',
    description: '无法连接到服务器，请检查网络连接'
  },
  'TimeoutError': {
    title: '请求超时',
    description: '请求超时，请稍后重试'
  },
  'AbortError': {
    title: '请求被取消',
    description: '请求被取消，请重新操作'
  }
}

/**
 * 获取用户友好的错误信息
 * @param error - 错误对象或错误消息
 * @returns 用户友好的错误信息
 */
export function getUserFriendlyError(error: unknown): { title: string; description: string } {
  // 提取错误消息
  let errorMessage = ''

  if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message)
  } else {
    errorMessage = '未知错误'
  }

  // 首先检查业务错误映射
  if (errorMessage in BUSINESS_ERROR_MAP) {
    return BUSINESS_ERROR_MAP[errorMessage]
  }

  // 检查系统错误映射
  if (errorMessage in SYSTEM_ERROR_MAP) {
    return SYSTEM_ERROR_MAP[errorMessage]
  }

  // 检查是否包含已知的业务错误关键词
  for (const [key, value] of Object.entries(BUSINESS_ERROR_MAP)) {
    if (errorMessage.includes(key)) {
      return value
    }
  }

  // 默认错误提示
  return {
    title: '操作失败',
    description: errorMessage || '操作失败，请稍后重试'
  }
}

/**
 * 处理API响应错误
 * @param response - fetch响应对象
 * @returns 错误信息
 */
export async function handleApiError(response: Response): Promise<{ title: string; description: string }> {
  try {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.message || errorData.detail || `HTTP错误: ${response.status}`
    return getUserFriendlyError(errorMessage)
  } catch {
    return getUserFriendlyError(`HTTP错误: ${response.status}`)
  }
}

/**
 * 获取重试建议
 * @param error - 错误对象
 * @returns 是否需要重试和建议
 */
export function getRetrySuggestion(error: unknown): { shouldRetry: boolean; suggestion?: string } {
  const errorInfo = getUserFriendlyError(error)

  // 网络相关错误建议重试
  const networkErrors = ['网络连接失败', '请求超时', '网络访问出错', '网络连接超时']
  if (networkErrors.includes(errorInfo.title)) {
    return {
      shouldRetry: true,
      suggestion: '建议检查网络后重试'
    }
  }

  // 文件上传失败建议重试
  if (errorInfo.title === '上传失败') {
    return {
      shouldRetry: true,
      suggestion: '建议检查文件格式和网络后重试'
    }
  }

  // 邮件发送失败建议稍后重试
  if (errorInfo.title === '邮件发送失败') {
    return {
      shouldRetry: true,
      suggestion: '建议稍后重试'
    }
  }

  // 其他错误不建议重试
  return { shouldRetry: false }
}