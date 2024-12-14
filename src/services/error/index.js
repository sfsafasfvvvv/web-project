import { ElMessage } from 'element-plus'

// 错误类型枚举
export const ErrorType = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  BUSINESS: 'BUSINESS',
  SYSTEM: 'SYSTEM'
}

// 错误码映射
export const ErrorCode = {
  // 网络错误
  NETWORK_ERROR: { code: 'NET_001', type: ErrorType.NETWORK, message: '网络连接失败' },
  TIMEOUT_ERROR: { code: 'NET_002', type: ErrorType.NETWORK, message: '请求超时' },
  
  // 认证错误
  UNAUTHORIZED: { code: 'AUTH_001', type: ErrorType.AUTH, message: '请先登录' },
  TOKEN_EXPIRED: { code: 'AUTH_002', type: ErrorType.AUTH, message: '登录已过期，请重新登录' },
  FORBIDDEN: { code: 'AUTH_003', type: ErrorType.AUTH, message: '没有权限执行此操作' },
  
  // 验证错误
  INVALID_PARAMS: { code: 'VAL_001', type: ErrorType.VALIDATION, message: '请求参数无效' },
  REQUIRED_FIELD: { code: 'VAL_002', type: ErrorType.VALIDATION, message: '必填字段不能为空' },
  
  // 业务错误
  RESOURCE_NOT_FOUND: { code: 'BIZ_001', type: ErrorType.BUSINESS, message: '请求的资源不存在' },
  DUPLICATE_RECORD: { code: 'BIZ_002', type: ErrorType.BUSINESS, message: '记录已存在' },
  
  // 系统错误
  SYSTEM_ERROR: { code: 'SYS_001', type: ErrorType.SYSTEM, message: '系统错误' },
  DATABASE_ERROR: { code: 'SYS_002', type: ErrorType.SYSTEM, message: '数据库错误' }
}

// 自定义错误类
export class AppError extends Error {
  constructor(errorCode, details = null) {
    super(errorCode.message)
    this.name = 'AppError'
    this.code = errorCode.code
    this.type = errorCode.type
    this.details = details
  }
}

// 错误处理器
export const errorHandler = {
  // 处理错误
  handle(error) {
    console.error('Error:', error)

    // 如果是自定义错误，直接使用错误信息
    if (error instanceof AppError) {
      this.showError(error.message)
      this.logError(error)
      return
    }

    // 处理 Axios 错误
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          this.handleAuthError(error)
          break
        case 403:
          this.showError(ErrorCode.FORBIDDEN.message)
          break
        case 404:
          this.showError(ErrorCode.RESOURCE_NOT_FOUND.message)
          break
        case 500:
          this.showError(ErrorCode.SYSTEM_ERROR.message)
          break
        default:
          this.showError('请求失��，请稍后重试')
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      this.showError(ErrorCode.NETWORK_ERROR.message)
    } else {
      // 请求配置出错
      this.showError('请求配置错误')
    }

    this.logError(error)
  },

  // 处理认证错误
  handleAuthError(error) {
    const token = localStorage.getItem('token')
    if (token) {
      // Token 过期
      this.showError(ErrorCode.TOKEN_EXPIRED.message)
      // 清除过期的 token
      localStorage.removeItem('token')
      // 跳转到登录页
      if (router) {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    } else {
      // 未登录
      this.showError(ErrorCode.UNAUTHORIZED.message)
    }
  },

  // 显示错误消息
  showError(message) {
    ElMessage.error(message)
  },

  // 记录错误日志
  logError(error) {
    // 在这里实现错误日志记录逻辑
    // 可以将错误信息发送到日志服务器
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type,
        details: error.details
      },
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // TODO: 发送错误日志到服务器
    console.error('Error Log:', errorLog)
  }
}

// 全局错误处理
export const setupErrorHandling = () => {
  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason)
  })

  // 处理未捕获的普通错误
  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error)
  })
}

// 创建错误
export const createError = (errorCode, details = null) => {
  return new AppError(errorCode, details)
}

// 断言函数
export const assert = (condition, errorCode, details = null) => {
  if (!condition) {
    throw createError(errorCode, details)
  }
}

// 业务验证函数
export const validate = {
  // 验证必填字段
  required(value, fieldName) {
    if (value === null || value === undefined || value === '') {
      throw createError(ErrorCode.REQUIRED_FIELD, {
        field: fieldName
      })
    }
  },

  // 验证字符串长度
  stringLength(value, min, max, fieldName) {
    if (typeof value !== 'string' || value.length < min || value.length > max) {
      throw createError(ErrorCode.INVALID_PARAMS, {
        field: fieldName,
        message: `${fieldName}长度应在${min}-${max}个字符之��`
      })
    }
  },

  // 验证数字范围
  numberRange(value, min, max, fieldName) {
    if (typeof value !== 'number' || value < min || value > max) {
      throw createError(ErrorCode.INVALID_PARAMS, {
        field: fieldName,
        message: `${fieldName}应在${min}-${max}之间`
      })
    }
  },

  // 验证手机号
  phone(value) {
    if (!/^1[3-9]\d{9}$/.test(value)) {
      throw createError(ErrorCode.INVALID_PARAMS, {
        field: '手机号',
        message: '请输入正确的手机号'
      })
    }
  },

  // 验证邮箱
  email(value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw createError(ErrorCode.INVALID_PARAMS, {
        field: '邮箱',
        message: '请输入正确的邮箱地址'
      })
    }
  }
}

export default {
  ErrorType,
  ErrorCode,
  AppError,
  errorHandler,
  setupErrorHandling,
  createError,
  assert,
  validate
} 