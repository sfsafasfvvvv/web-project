import { ref, computed } from 'vue'
import { eventBus } from '@/services/event-bus'
import { logger } from '@/services/logger'
import { i18n } from '@/services/i18n'

// 验证规则类型枚举
export const ValidatorType = {
  // 必填
  REQUIRED: 'required',
  
  // 字符串
  STRING: 'string',
  
  // 数字
  NUMBER: 'number',
  
  // 布尔
  BOOLEAN: 'boolean',
  
  // 数组
  ARRAY: 'array',
  
  // 对象
  OBJECT: 'object',
  
  // 日期
  DATE: 'date',
  
  // 邮箱
  EMAIL: 'email',
  
  // 手机号
  PHONE: 'phone',
  
  // URL
  URL: 'url',
  
  // IP地址
  IP: 'ip',
  
  // 正则表达式
  REGEX: 'regex',
  
  // 自定义
  CUSTOM: 'custom'
}

// 默认配置
const defaultConfig = {
  // 是否启用严格模式
  strict: true,
  
  // 是否缓存验证结果
  cache: true,
  
  // 缓存过期时间（毫秒）
  cacheExpiration: 5 * 60 * 1000, // 5分钟
  
  // 是否启用异步验证
  async: true,
  
  // 异步验证超时时间（毫秒）
  asyncTimeout: 5000,
  
  // 是否启用批量验证
  batch: true,
  
  // 是否在首次验证失败后停止
  stopOnFirstError: false
}

// 默认验证规则
const defaultRules = {
  [ValidatorType.REQUIRED]: {
    validate: (value) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0
      }
      return value !== undefined && value !== null && value !== ''
    },
    message: 'validation.required'
  },
  
  [ValidatorType.STRING]: {
    validate: (value) => typeof value === 'string',
    message: 'validation.string'
  },
  
  [ValidatorType.NUMBER]: {
    validate: (value) => typeof value === 'number' && !isNaN(value),
    message: 'validation.number'
  },
  
  [ValidatorType.BOOLEAN]: {
    validate: (value) => typeof value === 'boolean',
    message: 'validation.boolean'
  },
  
  [ValidatorType.ARRAY]: {
    validate: (value) => Array.isArray(value),
    message: 'validation.array'
  },
  
  [ValidatorType.OBJECT]: {
    validate: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    message: 'validation.object'
  },
  
  [ValidatorType.DATE]: {
    validate: (value) => value instanceof Date && !isNaN(value),
    message: 'validation.date'
  },
  
  [ValidatorType.EMAIL]: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'validation.email'
  },
  
  [ValidatorType.PHONE]: {
    validate: (value) => /^1[3-9]\d{9}$/.test(value),
    message: 'validation.phone'
  },
  
  [ValidatorType.URL]: {
    validate: (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },
    message: 'validation.url'
  },
  
  [ValidatorType.IP]: {
    validate: (value) => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value),
    message: 'validation.ip'
  }
}

class ValidatorService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.rules = ref(new Map(Object.entries(defaultRules)))
    this.cache = new Map()
    
    // 初始化
    this.init()
  }

  // 初始化
  init() {
    // 清除过期缓存
    if (this.config.cache) {
      setInterval(() => {
        this.clearExpiredCache()
      }, this.config.cacheExpiration)
    }
  }

  // 添加验证规则
  addRule(type, rule) {
    this.rules.value.set(type, {
      validate: rule.validate,
      message: rule.message || `validation.${type}`,
      async: rule.async || false
    })
  }

  // 移除验证规则
  removeRule(type) {
    this.rules.value.delete(type)
  }

  // 验证值
  async validate(value, rules = [], options = {}) {
    const config = { ...this.config, ...options }
    const errors = []

    // 检查缓存
    if (config.cache) {
      const cacheKey = this.getCacheKey(value, rules)
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < config.cacheExpiration) {
        return cached.result
      }
    }

    // 批量验证
    if (config.batch) {
      const results = await Promise.all(
        rules.map(rule => this.validateRule(value, rule, config))
      )
      
      errors.push(...results.filter(Boolean))
    } else {
      // 单个验证
      for (const rule of rules) {
        const error = await this.validateRule(value, rule, config)
        if (error) {
          errors.push(error)
          if (config.stopOnFirstError) {
            break
          }
        }
      }
    }

    const result = {
      valid: errors.length === 0,
      errors
    }

    // 更新缓存
    if (config.cache) {
      const cacheKey = this.getCacheKey(value, rules)
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })
    }

    return result
  }

  // 验证单个规则
  async validateRule(value, rule, config) {
    try {
      // 获取规则配置
      const ruleConfig = this.getRuleConfig(rule)
      if (!ruleConfig) return null

      // 执行验证
      let valid
      if (ruleConfig.async && config.async) {
        // 异步验证
        valid = await Promise.race([
          ruleConfig.validate(value, rule.options),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Validation timeout')), config.asyncTimeout)
          })
        ])
      } else {
        // 同步验证
        valid = ruleConfig.validate(value, rule.options)
      }

      if (!valid) {
        return {
          type: rule.type,
          message: this.getErrorMessage(rule, ruleConfig),
          field: rule.field
        }
      }

      return null
    } catch (error) {
      logger.error('Validation error:', error)
      return {
        type: rule.type,
        message: error.message,
        field: rule.field
      }
    }
  }

  // 获取规则配置
  getRuleConfig(rule) {
    if (typeof rule === 'string') {
      return this.rules.value.get(rule)
    }

    if (typeof rule === 'object') {
      if (rule.type === ValidatorType.CUSTOM) {
        return {
          validate: rule.validate,
          message: rule.message,
          async: rule.async
        }
      }
      return this.rules.value.get(rule.type)
    }

    return null
  }

  // 获取错误消息
  getErrorMessage(rule, ruleConfig) {
    const message = rule.message || ruleConfig.message
    
    // 如果是i18n key，翻译
    if (typeof message === 'string' && message.includes('.')) {
      return i18n.translate(message, rule.options)
    }
    
    // 如果是函数，执行
    if (typeof message === 'function') {
      return message(rule.options)
    }
    
    return message
  }

  // 获取缓存键
  getCacheKey(value, rules) {
    return JSON.stringify({
      value,
      rules: rules.map(rule => {
        if (typeof rule === 'string') {
          return rule
        }
        return {
          type: rule.type,
          options: rule.options
        }
      })
    })
  }

  // 清除过期缓存
  clearExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.cacheExpiration) {
        this.cache.delete(key)
      }
    }
  }

  // 清除所有缓存
  clearCache() {
    this.cache.clear()
  }

  // 创建表单验证器
  createFormValidator(schema, options = {}) {
    return {
      // 验证整个表单
      async validateForm(form) {
        const errors = new Map()
        
        for (const [field, rules] of Object.entries(schema)) {
          const result = await this.validate(form[field], rules, options)
          if (!result.valid) {
            errors.set(field, result.errors)
          }
        }
        
        return {
          valid: errors.size === 0,
          errors
        }
      },
      
      // 验证单个字段
      async validateField(field, value) {
        const rules = schema[field]
        if (!rules) return { valid: true, errors: [] }
        
        return await this.validate(value, rules, options)
      }
    }
  }

  // 创建Vue指令
  directive(app) {
    // v-validate 指令
    app.directive('validate', {
      mounted: async (el, binding) => {
        const rules = binding.value
        const field = binding.arg
        
        el.addEventListener('blur', async () => {
          const result = await this.validate(el.value, rules)
          
          // 触发验证事件
          eventBus.emit('validate', {
            field,
            result
          })
          
          // 更新UI
          if (result.valid) {
            el.classList.remove('invalid')
            el.classList.add('valid')
          } else {
            el.classList.remove('valid')
            el.classList.add('invalid')
          }
        })
      }
    })
  }

  // 创建Vue插件
  plugin = {
    install(app) {
      // 添加全局属性
      app.config.globalProperties.$validator = this
      
      // 添加指令
      this.directive(app)
      
      // 添加组合式API
      app.provide('validator', this)
    }
  }
}

// 创建验证服务实例
export const validator = new ValidatorService()

export default validator 