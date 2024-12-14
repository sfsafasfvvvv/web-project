import { localStorage } from '@/services/storage'

// 日志级别枚举
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
}

// 日志类型枚举
export const LogType = {
  // 系统日志
  SYSTEM: 'system',
  
  // 用户操作日志
  USER_ACTION: 'user_action',
  
  // API请求日志
  API_REQUEST: 'api_request',
  
  // 错误日志
  ERROR: 'error',
  
  // 性能日志
  PERFORMANCE: 'performance'
}

// 日志配置
const defaultConfig = {
  // 存储键名
  storageKey: 'logs',
  
  // 最大存储数量
  maxCount: 1000,
  
  // 是否在控制台输出
  console: true,
  
  // 是否发送到服务器
  remote: false,
  
  // 远程日志服务器地址
  remoteUrl: '',
  
  // 最小日志级别
  minLevel: LogLevel.DEBUG,
  
  // 是否包含时间戳
  timestamp: true,
  
  // 是否包含调用栈
  stacktrace: true,
  
  // 是否包含用户信息
  userInfo: true
}

class LoggerService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.logs = this.loadLogs()
  }

  // 加载日志
  loadLogs() {
    return localStorage.get(this.config.storageKey) || []
  }

  // 保存日志
  saveLogs() {
    // 限制最大存储数量
    if (this.logs.length > this.config.maxCount) {
      this.logs = this.logs.slice(-this.config.maxCount)
    }
    localStorage.set(this.config.storageKey, this.logs)
  }

  // 创建日志对象
  createLogEntry(level, type, message, data = null) {
    const log = {
      level,
      type,
      message,
      data
    }

    // 添加时间戳
    if (this.config.timestamp) {
      log.timestamp = new Date().toISOString()
    }

    // 添加调用栈
    if (this.config.stacktrace && level === LogLevel.ERROR) {
      log.stacktrace = new Error().stack
    }

    // 添加用户信息
    if (this.config.userInfo) {
      log.user = this.getUserInfo()
    }

    return log
  }

  // 获取用户信息
  getUserInfo() {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user) {
        return {
          id: user.id,
          username: user.username
        }
      }
    } catch (error) {
      console.error('Get user info error:', error)
    }
    return null
  }

  // 记录日志
  log(level, type, message, data = null) {
    // 检查日志级别
    if (!this.shouldLog(level)) {
      return
    }

    const logEntry = this.createLogEntry(level, type, message, data)

    // 添加到日志列表
    this.logs.push(logEntry)
    this.saveLogs()

    // 控制台输出
    if (this.config.console) {
      this.consoleLog(logEntry)
    }

    // 发送到服务器
    if (this.config.remote) {
      this.remoteLog(logEntry)
    }
  }

  // 检查是否应该记录日志
  shouldLog(level) {
    const levels = Object.values(LogLevel)
    const minLevelIndex = levels.indexOf(this.config.minLevel)
    const currentLevelIndex = levels.indexOf(level)
    return currentLevelIndex >= minLevelIndex
  }

  // 控制台输出
  consoleLog(log) {
    const { level, message, data } = log
    const timestamp = log.timestamp ? `[${new Date(log.timestamp).toLocaleString()}]` : ''
    const type = `[${log.type}]`
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(timestamp, type, message, data || '')
        break
      case LogLevel.INFO:
        console.info(timestamp, type, message, data || '')
        break
      case LogLevel.WARN:
        console.warn(timestamp, type, message, data || '')
        break
      case LogLevel.ERROR:
        console.error(timestamp, type, message, data || '')
        if (log.stacktrace) {
          console.error(log.stacktrace)
        }
        break
    }
  }

  // 发送到服务器
  async remoteLog(log) {
    if (!this.config.remoteUrl) return

    try {
      await fetch(this.config.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(log)
      })
    } catch (error) {
      console.error('Remote log error:', error)
    }
  }

  // Debug级别日志
  debug(message, data = null, type = LogType.SYSTEM) {
    this.log(LogLevel.DEBUG, type, message, data)
  }

  // Info级别日志
  info(message, data = null, type = LogType.SYSTEM) {
    this.log(LogLevel.INFO, type, message, data)
  }

  // Warn级别日志
  warn(message, data = null, type = LogType.SYSTEM) {
    this.log(LogLevel.WARN, type, message, data)
  }

  // Error级别日志
  error(message, data = null, type = LogType.ERROR) {
    this.log(LogLevel.ERROR, type, message, data)
  }

  // 记录用户操作
  logUserAction(action, data = null) {
    this.info(action, data, LogType.USER_ACTION)
  }

  // 记录API请求
  logApiRequest(method, url, data = null, response = null) {
    this.debug(
      `${method.toUpperCase()} ${url}`,
      { request: data, response },
      LogType.API_REQUEST
    )
  }

  // 记录API错误
  logApiError(method, url, error) {
    this.error(
      `${method.toUpperCase()} ${url} failed`,
      error,
      LogType.API_REQUEST
    )
  }

  // 记录性能指标
  logPerformance(metric, value, data = null) {
    this.debug(metric, { value, ...data }, LogType.PERFORMANCE)
  }

  // 获取所有日志
  getLogs() {
    return this.logs
  }

  // 获取指定级别的日志
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level)
  }

  // 获取指定类型的日志
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type)
  }

  // 获取指定时间范围的日志
  getLogsByTimeRange(startTime, endTime) {
    return this.logs.filter(log => {
      const timestamp = new Date(log.timestamp).getTime()
      return timestamp >= startTime && timestamp <= endTime
    })
  }

  // 清除所有日志
  clearLogs() {
    this.logs = []
    this.saveLogs()
  }

  // 导出日志
  exportLogs(format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(this.logs, null, 2)
      case 'csv':
        return this.exportLogsToCSV()
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  // 导出为CSV格式
  exportLogsToCSV() {
    if (this.logs.length === 0) return ''

    // 获取所有可能的字段
    const fields = new Set()
    this.logs.forEach(log => {
      Object.keys(log).forEach(key => fields.add(key))
    })

    // 创建CSV头
    const header = Array.from(fields).join(',')
    
    // 创建CSV行
    const rows = this.logs.map(log => {
      return Array.from(fields).map(field => {
        const value = log[field]
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        return value
      }).join(',')
    })

    return [header, ...rows].join('\n')
  }
}

// 创建日志服务实例
export const logger = new LoggerService()

// 全局错误处理
window.addEventListener('error', (event) => {
  logger.error(event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })
})

// 未处理的Promise错误
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled Promise rejection', {
    reason: event.reason
  })
})

export default logger 