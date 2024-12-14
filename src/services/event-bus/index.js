import { logger } from '@/services/logger'

// 事件类型枚举
export const EventType = {
  // 应用生命周期
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  
  // 路由相关
  ROUTE_CHANGE: 'route:change',
  ROUTE_ERROR: 'route:error',
  
  // 用户相关
  USER_LOGIN: 'user:login',
  USER_LOGOUT: 'user:logout',
  USER_UPDATE: 'user:update',
  
  // 数据相关
  DATA_CHANGE: 'data:change',
  DATA_ERROR: 'data:error',
  
  // UI相关
  UI_CHANGE: 'ui:change',
  UI_ERROR: 'ui:error',
  
  // 网络相关
  NETWORK_ONLINE: 'network:online',
  NETWORK_OFFLINE: 'network:offline',
  NETWORK_ERROR: 'network:error'
}

// 事件优先级枚举
export const EventPriority = {
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  IMMEDIATE: 3
}

// 事件配置
const defaultConfig = {
  // 是否启用调试模式
  debug: false,
  
  // 是否记录事件历史
  history: true,
  
  // 历史记录最大数量
  historyMaxLength: 100,
  
  // 是否允许重复事件
  allowDuplicate: false,
  
  // 重复事件的最小间隔（毫秒）
  duplicateInterval: 100,
  
  // 是否启用异步事件
  async: true,
  
  // 异步事件的默认延迟（毫秒）
  asyncDelay: 0,
  
  // 是否启用事件过滤
  filter: true,
  
  // 是否启用事件转换
  transform: true
}

// 事件对象
class Event {
  constructor(type, data = null, options = {}) {
    this.type = type
    this.data = data
    this.timestamp = Date.now()
    this.priority = options.priority || EventPriority.NORMAL
    this.async = options.async !== undefined ? options.async : true
    this.delay = options.delay || 0
    this.source = options.source || null
    this.target = options.target || null
    this.meta = options.meta || {}
  }

  // 克隆事件
  clone() {
    return new Event(this.type, this.data, {
      priority: this.priority,
      async: this.async,
      delay: this.delay,
      source: this.source,
      target: this.target,
      meta: { ...this.meta }
    })
  }
}

// 订阅者对象
class Subscriber {
  constructor(callback, options = {}) {
    this.callback = callback
    this.priority = options.priority || EventPriority.NORMAL
    this.async = options.async !== undefined ? options.async : true
    this.once = options.once || false
    this.filter = options.filter || null
    this.transform = options.transform || null
    this.context = options.context || null
    this.id = options.id || Date.now()
  }

  // 执行回���
  async execute(event) {
    try {
      // 过滤事件
      if (this.filter && !this.filter(event)) {
        return
      }

      // 转换事件
      if (this.transform) {
        event = this.transform(event)
      }

      // 执行回调
      if (this.async) {
        await this.callback.call(this.context, event)
      } else {
        this.callback.call(this.context, event)
      }

      return true
    } catch (error) {
      logger.error('Event execution error:', {
        error,
        event,
        subscriber: this
      })
      return false
    }
  }
}

class EventBusService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.subscribers = new Map()
    this.history = []
    this.lastEvents = new Map()
  }

  // 订阅事件
  on(type, callback, options = {}) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set())
    }

    const subscriber = new Subscriber(callback, options)
    this.subscribers.get(type).add(subscriber)

    if (this.config.debug) {
      logger.debug('Event subscribed:', {
        type,
        subscriber
      })
    }

    return subscriber.id
  }

  // 取消订阅
  off(type, subscriberId) {
    if (!this.subscribers.has(type)) {
      return false
    }

    const subscribers = this.subscribers.get(type)
    for (const subscriber of subscribers) {
      if (subscriber.id === subscriberId) {
        subscribers.delete(subscriber)
        
        if (this.config.debug) {
          logger.debug('Event unsubscribed:', {
            type,
            subscriberId
          })
        }
        
        return true
      }
    }

    return false
  }

  // 只订阅一次
  once(type, callback, options = {}) {
    return this.on(type, callback, { ...options, once: true })
  }

  // 发布事件
  emit(type, data = null, options = {}) {
    // 创建事件对象
    const event = new Event(type, data, options)

    // 检查重复事件
    if (!this.config.allowDuplicate) {
      const lastEvent = this.lastEvents.get(type)
      if (lastEvent && event.timestamp - lastEvent.timestamp < this.config.duplicateInterval) {
        return false
      }
    }

    // 记录事件
    this.lastEvents.set(type, event)
    if (this.config.history) {
      this.addToHistory(event)
    }

    // 调试日志
    if (this.config.debug) {
      logger.debug('Event emitted:', {
        type,
        data,
        options
      })
    }

    // 获取订阅者
    const subscribers = this.subscribers.get(type)
    if (!subscribers || subscribers.size === 0) {
      return false
    }

    // ���优先级排序
    const sortedSubscribers = Array.from(subscribers)
      .sort((a, b) => b.priority - a.priority)

    // 执行回调
    for (const subscriber of sortedSubscribers) {
      try {
        if (event.async && this.config.async) {
          setTimeout(async () => {
            await subscriber.execute(event)
            if (subscriber.once) {
              subscribers.delete(subscriber)
            }
          }, event.delay)
        } else {
          subscriber.execute(event)
          if (subscriber.once) {
            subscribers.delete(subscriber)
          }
        }
      } catch (error) {
        logger.error('Event emit error:', {
          error,
          event,
          subscriber
        })
      }
    }

    return true
  }

  // 添加到历史记录
  addToHistory(event) {
    this.history.push(event)
    if (this.history.length > this.config.historyMaxLength) {
      this.history.shift()
    }
  }

  // 获取事件历史
  getHistory() {
    return this.history
  }

  // 清空事件历史
  clearHistory() {
    this.history = []
  }

  // 获取订阅者数量
  getSubscriberCount(type) {
    const subscribers = this.subscribers.get(type)
    return subscribers ? subscribers.size : 0
  }

  // 获取所有事件类型
  getEventTypes() {
    return Array.from(this.subscribers.keys())
  }

  // 是否有订阅者
  hasSubscribers(type) {
    return this.getSubscriberCount(type) > 0
  }

  // 清空所有订阅
  clear() {
    this.subscribers.clear()
    this.history = []
    this.lastEvents.clear()
  }

  // 批量订阅
  onMany(events) {
    const ids = []
    for (const [type, callback, options] of events) {
      ids.push(this.on(type, callback, options))
    }
    return ids
  }

  // 批量取消订阅
  offMany(subscriptions) {
    for (const [type, id] of subscriptions) {
      this.off(type, id)
    }
  }

  // 批量发布
  emitMany(events) {
    for (const [type, data, options] of events) {
      this.emit(type, data, options)
    }
  }

  // 等待事件
  waitFor(type, timeout = 0) {
    return new Promise((resolve, reject) => {
      const timer = timeout > 0 ? setTimeout(() => {
        this.off(type, id)
        reject(new Error(`Event timeout: ${type}`))
      }, timeout) : null

      const id = this.once(type, (event) => {
        if (timer) clearTimeout(timer)
        resolve(event)
      })
    })
  }

  // 过滤事件
  filter(type, filterFn) {
    return this.on(type, (event) => {
      if (filterFn(event)) {
        this.emit(`${type}:filtered`, event)
      }
    })
  }

  // 转换事件
  transform(type, transformFn) {
    return this.on(type, (event) => {
      const transformedEvent = transformFn(event)
      this.emit(`${type}:transformed`, transformedEvent)
    })
  }

  // 创建事件命名空间
  namespace(ns) {
    const prefix = `${ns}:`
    return {
      on: (type, callback, options) => 
        this.on(prefix + type, callback, options),
      off: (type, id) => 
        this.off(prefix + type, id),
      once: (type, callback, options) => 
        this.once(prefix + type, callback, options),
      emit: (type, data, options) => 
        this.emit(prefix + type, data, options),
      clear: () => {
        for (const type of this.getEventTypes()) {
          if (type.startsWith(prefix)) {
            this.subscribers.delete(type)
          }
        }
      }
    }
  }
}

// 创建事件总线实例
export const eventBus = new EventBusService()

export default eventBus 