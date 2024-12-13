// 存储类型枚举
export const StorageType = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage'
}

// 默认配置
const defaultConfig = {
  prefix: 'campus_market_',
  expire: 7 * 24 * 60 * 60 * 1000, // 7天
  type: StorageType.LOCAL
}

// 存储项
class StorageItem {
  constructor(key, value, expire = defaultConfig.expire) {
    this.key = key
    this.value = value
    this.expire = expire
    this.timestamp = new Date().getTime()
  }
}

// 存储服务
class StorageService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.storage = window[this.config.type]
  }

  // 获取完整的键名
  getKey(key) {
    return this.config.prefix + key
  }

  // 设置存储项
  set(key, value, expire = this.config.expire) {
    const item = new StorageItem(key, value, expire)
    try {
      this.storage.setItem(
        this.getKey(key),
        JSON.stringify(item)
      )
      return true
    } catch (error) {
      console.error('Storage set error:', error)
      return false
    }
  }

  // 获取存储项
  get(key) {
    try {
      const item = JSON.parse(
        this.storage.getItem(this.getKey(key))
      )
      
      if (!item) return null

      // 检查是否过期
      if (new Date().getTime() - item.timestamp > item.expire) {
        this.remove(key)
        return null
      }

      return item.value
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  // 移除存储项
  remove(key) {
    try {
      this.storage.removeItem(this.getKey(key))
      return true
    } catch (error) {
      console.error('Storage remove error:', error)
      return false
    }
  }

  // 清除所有存储项
  clear() {
    try {
      const keys = Object.keys(this.storage)
      keys.forEach(key => {
        if (key.startsWith(this.config.prefix)) {
          this.storage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      console.error('Storage clear error:', error)
      return false
    }
  }

  // 获取所有存储项
  getAll() {
    try {
      const result = {}
      const keys = Object.keys(this.storage)
      keys.forEach(key => {
        if (key.startsWith(this.config.prefix)) {
          const realKey = key.slice(this.config.prefix.length)
          result[realKey] = this.get(realKey)
        }
      })
      return result
    } catch (error) {
      console.error('Storage getAll error:', error)
      return {}
    }
  }

  // 获取存储使用量
  getSize() {
    try {
      let size = 0
      const keys = Object.keys(this.storage)
      keys.forEach(key => {
        if (key.startsWith(this.config.prefix)) {
          size += this.storage.getItem(key).length * 2 // UTF-16 编码，每个字符占2字节
        }
      })
      return size
    } catch (error) {
      console.error('Storage getSize error:', error)
      return 0
    }
  }

  // 检查存储项是否存在
  has(key) {
    return this.get(key) !== null
  }

  // 获取所有键名
  keys() {
    try {
      const result = []
      const keys = Object.keys(this.storage)
      keys.forEach(key => {
        if (key.startsWith(this.config.prefix)) {
          result.push(key.slice(this.config.prefix.length))
        }
      })
      return result
    } catch (error) {
      console.error('Storage keys error:', error)
      return []
    }
  }

  // 获取存储项数量
  count() {
    return this.keys().length
  }

  // 批量设置存储项
  setMany(items) {
    try {
      Object.entries(items).forEach(([key, value]) => {
        this.set(key, value)
      })
      return true
    } catch (error) {
      console.error('Storage setMany error:', error)
      return false
    }
  }

  // ��量获取存储项
  getMany(keys) {
    try {
      const result = {}
      keys.forEach(key => {
        result[key] = this.get(key)
      })
      return result
    } catch (error) {
      console.error('Storage getMany error:', error)
      return {}
    }
  }

  // 批量移除存储项
  removeMany(keys) {
    try {
      keys.forEach(key => {
        this.remove(key)
      })
      return true
    } catch (error) {
      console.error('Storage removeMany error:', error)
      return false
    }
  }

  // 设置永久存储项
  setPermanent(key, value) {
    return this.set(key, value, Number.MAX_SAFE_INTEGER)
  }

  // 设置临时存储项
  setTemp(key, value, expire = 60 * 1000) { // 默认1分钟
    return this.set(key, value, expire)
  }
}

// 创建存储实例
export const localStorage = new StorageService({
  type: StorageType.LOCAL
})

export const sessionStorage = new StorageService({
  type: StorageType.SESSION
})

// 缓存服务
class CacheService {
  constructor() {
    this.cache = new Map()
  }

  // 设置缓存
  set(key, value, expire = defaultConfig.expire) {
    const item = new StorageItem(key, value, expire)
    this.cache.set(key, item)
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    // 检查是否过��
    if (new Date().getTime() - item.timestamp > item.expire) {
      this.remove(key)
      return null
    }

    return item.value
  }

  // 移除缓存
  remove(key) {
    this.cache.delete(key)
  }

  // 清除所有缓存
  clear() {
    this.cache.clear()
  }

  // 获取缓存大小
  size() {
    return this.cache.size
  }

  // 检查缓存是否存在
  has(key) {
    return this.get(key) !== null
  }

  // 获取所有缓存键
  keys() {
    return Array.from(this.cache.keys())
  }

  // 获取所有缓存值
  values() {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  // 设置永久缓存
  setPermanent(key, value) {
    this.set(key, value, Number.MAX_SAFE_INTEGER)
  }

  // 设置临时缓存
  setTemp(key, value, expire = 60 * 1000) { // 默认1分钟
    this.set(key, value, expire)
  }
}

// 创建缓存实例
export const cache = new CacheService()

export default {
  localStorage,
  sessionStorage,
  cache
} 