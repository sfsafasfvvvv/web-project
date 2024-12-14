// 缓存类型枚举
export const CacheType = {
  MEMORY: 'memory',
  LOCAL: 'local',
  SESSION: 'session'
}

// 缓存配置
const defaultConfig = {
  // 默认缓存类型
  type: CacheType.MEMORY,
  
  // 默认过期时间（毫秒）
  expire: 24 * 60 * 60 * 1000, // 1天
  
  // 默认版本号
  version: '1.0.0',
  
  // 默认前缀
  prefix: 'cache_',
  
  // 默认序列化方法
  serialize: JSON.stringify,
  
  // 默认反序列化方法
  deserialize: JSON.parse,
  
  // 是否在过期时自动清除
  autoClean: true,
  
  // 自动清除间隔（毫秒）
  cleanInterval: 60 * 1000, // 1分钟
  
  // 最大缓存数量
  maxItems: 1000,
  
  // 最大缓存大小（字节）
  maxSize: 10 * 1024 * 1024 // 10MB
}

// 缓存项
class CacheItem {
  constructor(key, value, options = {}) {
    this.key = key
    this.value = value
    this.createTime = Date.now()
    this.accessTime = Date.now()
    this.expire = options.expire || defaultConfig.expire
    this.version = options.version || defaultConfig.version
  }

  // 是否过期
  isExpired() {
    return Date.now() - this.createTime > this.expire
  }

  // 更新访问时间
  updateAccessTime() {
    this.accessTime = Date.now()
  }

  // 获取剩余时间
  getTimeToLive() {
    const expireTime = this.createTime + this.expire
    return Math.max(0, expireTime - Date.now())
  }

  // 序列化
  serialize() {
    return {
      key: this.key,
      value: this.value,
      createTime: this.createTime,
      accessTime: this.accessTime,
      expire: this.expire,
      version: this.version
    }
  }

  // 反序列化
  static deserialize(data) {
    const item = new CacheItem(data.key, data.value, {
      expire: data.expire,
      version: data.version
    })
    item.createTime = data.createTime
    item.accessTime = data.accessTime
    return item
  }
}

class CacheService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.cache = new Map()
    this.storage = this.getStorage()
    this.size = 0

    // 初始化
    this.init()

    // 启动自动清理
    if (this.config.autoClean) {
      this.startAutoClean()
    }
  }

  // 初始化
  init() {
    if (this.config.type !== CacheType.MEMORY) {
      try {
        // 从存储中恢复缓存
        const data = this.storage.getItem(this.config.prefix + 'data')
        if (data) {
          const items = this.config.deserialize(data)
          for (const [key, value] of Object.entries(items)) {
            const item = CacheItem.deserialize(value)
            if (!item.isExpired()) {
              this.cache.set(key, item)
              this.size += this.getItemSize(item)
            }
          }
        }

        // 检查版本号
        const version = this.storage.getItem(this.config.prefix + 'version')
        if (version !== this.config.version) {
          this.clear()
          this.storage.setItem(this.config.prefix + 'version', this.config.version)
        }
      } catch (error) {
        console.error('Cache init error:', error)
        this.clear()
      }
    }
  }

  // 获取存储对象
  getStorage() {
    switch (this.config.type) {
      case CacheType.LOCAL:
        return localStorage
      case CacheType.SESSION:
        return sessionStorage
      default:
        return null
    }
  }

  // 获取缓存项大小
  getItemSize(item) {
    try {
      return new Blob([this.config.serialize(item)]).size
    } catch (error) {
      return 0
    }
  }

  // 保存到存储
  saveToStorage() {
    if (this.storage) {
      try {
        const data = {}
        for (const [key, item] of this.cache.entries()) {
          data[key] = item.serialize()
        }
        this.storage.setItem(
          this.config.prefix + 'data',
          this.config.serialize(data)
        )
      } catch (error) {
        console.error('Cache save error:', error)
      }
    }
  }

  // 设置缓存
  set(key, value, options = {}) {
    // 检查缓存数量
    if (this.cache.size >= this.config.maxItems) {
      this.removeOldest()
    }

    // 创建缓存项
    const item = new CacheItem(key, value, options)
    const size = this.getItemSize(item)

    // 检查缓存大小
    if (this.size + size > this.config.maxSize) {
      this.removeOldest()
    }

    // 更新缓存
    this.cache.set(key, item)
    this.size += size

    // 保存到存储
    this.saveToStorage()

    return true
  }

  // 获取缓存
  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // 检查是否过期
    if (item.isExpired()) {
      this.remove(key)
      return null
    }

    // 更新访问时间
    item.updateAccessTime()
    return item.value
  }

  // 移除缓存
  remove(key) {
    const item = this.cache.get(key)
    if (item) {
      this.size -= this.getItemSize(item)
      this.cache.delete(key)
      this.saveToStorage()
    }
    return true
  }

  // 清空缓存
  clear() {
    this.cache.clear()
    this.size = 0
    if (this.storage) {
      this.storage.removeItem(this.config.prefix + 'data')
    }
    return true
  }

  // 获取缓存数量
  count() {
    return this.cache.size
  }

  // 获取缓存大小
  getSize() {
    return this.size
  }

  // 获取所有键
  keys() {
    return Array.from(this.cache.keys())
  }

  // 获取所有值
  values() {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  // 获取所有项
  entries() {
    return Array.from(this.cache.entries()).map(([key, item]) => [
      key,
      item.value
    ])
  }

  // 是否包含键
  has(key) {
    return this.get(key) !== null
  }

  // 获取缓存信息
  getInfo() {
    return {
      type: this.config.type,
      size: this.size,
      count: this.cache.size,
      maxSize: this.config.maxSize,
      maxItems: this.config.maxItems,
      version: this.config.version
    }
  }

  // 移除最旧的缓存项
  removeOldest() {
    let oldest = null
    let oldestKey = null

    for (const [key, item] of this.cache.entries()) {
      if (!oldest || item.accessTime < oldest.accessTime) {
        oldest = item
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.remove(oldestKey)
    }
  }

  // 移除过期项
  removeExpired() {
    for (const [key, item] of this.cache.entries()) {
      if (item.isExpired()) {
        this.remove(key)
      }
    }
  }

  // 启动自动清理
  startAutoClean() {
    setInterval(() => {
      this.removeExpired()
    }, this.config.cleanInterval)
  }

  // 批量设置
  setMany(items, options = {}) {
    for (const [key, value] of Object.entries(items)) {
      this.set(key, value, options)
    }
    return true
  }

  // 批量获取
  getMany(keys) {
    const result = {}
    for (const key of keys) {
      result[key] = this.get(key)
    }
    return result
  }

  // 批量移除
  removeMany(keys) {
    for (const key of keys) {
      this.remove(key)
    }
    return true
  }

  // 设置永久缓存
  setPermanent(key, value) {
    return this.set(key, value, { expire: Number.MAX_SAFE_INTEGER })
  }

  // 设置临时缓存
  setTemp(key, value, expire = 60 * 1000) {
    return this.set(key, value, { expire })
  }
}

// 创建缓存服务实例
export const cache = new CacheService()

export default cache 