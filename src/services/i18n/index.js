import { ref, computed } from 'vue'
import { localStorage } from '@/services/storage'
import { eventBus } from '@/services/event-bus'

// 语言类型枚举
export const LanguageType = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
}

// 默认配置
const defaultConfig = {
  // 默认语言
  defaultLanguage: LanguageType.ZH_CN,
  
  // 存储键名
  storageKey: 'language',
  
  // 是否自动检测浏览器语言
  autoDetect: true,
  
  // 是否持久化
  persistent: true,
  
  // 是否启用回退语言
  fallback: true,
  
  // 回退语言
  fallbackLanguage: LanguageType.EN_US
}

// 语言包
const messages = {
  [LanguageType.ZH_CN]: {
    common: {
      ok: '确定',
      cancel: '取消',
      confirm: '确认',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      loading: '加载中...',
      noData: '暂无数据',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '提示'
    },
    auth: {
      login: '登录',
      register: '注册',
      logout: '退出登录',
      username: '用户名',
      password: '密码',
      email: '邮箱',
      phone: '手机号',
      forgotPassword: '忘记密码',
      rememberMe: '记住我'
    },
    user: {
      profile: '个人资料',
      settings: '设置',
      notifications: '通知',
      messages: '消息',
      following: '关注',
      followers: '粉丝',
      posts: '发布',
      likes: '点赞'
    },
    product: {
      title: '标题',
      description: '描述',
      price: '价格',
      category: '分类',
      tags: '标签',
      images: '图片',
      publish: '发布',
      edit: '编辑',
      delete: '删除',
      favorite: '收藏',
      share: '分享'
    },
    validation: {
      required: '必填项',
      email: '请输入有效的邮箱地址',
      phone: '请输入有效的手机号',
      min: '不能小于{min}',
      max: '不能大于{max}',
      length: '长度必须为{length}',
      password: '密码必须包含数字和字母'
    }
  },
  [LanguageType.EN_US]: {
    common: {
      ok: 'OK',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      noData: 'No Data',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
    },
    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      username: 'Username',
      password: 'Password',
      email: 'Email',
      phone: 'Phone',
      forgotPassword: 'Forgot Password',
      rememberMe: 'Remember Me'
    },
    user: {
      profile: 'Profile',
      settings: 'Settings',
      notifications: 'Notifications',
      messages: 'Messages',
      following: 'Following',
      followers: 'Followers',
      posts: 'Posts',
      likes: 'Likes'
    },
    product: {
      title: 'Title',
      description: 'Description',
      price: 'Price',
      category: 'Category',
      tags: 'Tags',
      images: 'Images',
      publish: 'Publish',
      edit: 'Edit',
      delete: 'Delete',
      favorite: 'Favorite',
      share: 'Share'
    },
    validation: {
      required: 'Required',
      email: 'Please enter a valid email',
      phone: 'Please enter a valid phone number',
      min: 'Cannot be less than {min}',
      max: 'Cannot be greater than {max}',
      length: 'Length must be {length}',
      password: 'Password must contain numbers and letters'
    }
  }
}

class I18nService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.messages = messages
    this.currentLanguage = ref(this.getInitialLanguage())
  }

  // 获取初始语言
  getInitialLanguage() {
    // 从存储中获取
    if (this.config.persistent) {
      const stored = localStorage.get(this.config.storageKey)
      if (stored) return stored
    }

    // 自动检测浏览器语言
    if (this.config.autoDetect) {
      const browserLang = navigator.language
      if (this.isSupported(browserLang)) {
        return browserLang
      }
    }

    return this.config.defaultLanguage
  }

  // 切换语言
  setLanguage(lang) {
    if (!this.isSupported(lang)) {
      console.warn(`Language ${lang} is not supported`)
      return false
    }

    this.currentLanguage.value = lang

    if (this.config.persistent) {
      localStorage.set(this.config.storageKey, lang)
    }

    // 触发语言变更事件
    eventBus.emit('language:change', lang)

    return true
  }

  // 获取当前语言
  getLanguage() {
    return this.currentLanguage.value
  }

  // 检查语言是否支持
  isSupported(lang) {
    return !!this.messages[lang]
  }

  // 获取支持的语言列表
  getSupportedLanguages() {
    return Object.keys(this.messages)
  }

  // 添加语言包
  addMessages(lang, messages) {
    if (!this.messages[lang]) {
      this.messages[lang] = {}
    }
    Object.assign(this.messages[lang], messages)
  }

  // 移除语言包
  removeMessages(lang) {
    delete this.messages[lang]
  }

  // 翻译文本
  translate(key, params = {}) {
    const keys = key.split('.')
    let value = this.messages[this.currentLanguage.value]

    // 查找翻译文本
    for (const k of keys) {
      if (!value || !value[k]) {
        // 使用回退语言
        if (this.config.fallback) {
          value = this.messages[this.config.fallbackLanguage]
          for (const fk of keys) {
            if (!value || !value[fk]) {
              return key
            }
            value = value[fk]
          }
          break
        }
        return key
      }
      value = value[k]
    }

    // 替换参数
    if (typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (_, key) => {
        return params[key] || `{${key}}`
      })
    }

    return value
  }

  // 批量翻译
  translateBatch(keys, params = {}) {
    const result = {}
    for (const key of keys) {
      result[key] = this.translate(key, params)
    }
    return result
  }

  // 创建计算属性
  computed(key, params = {}) {
    return computed(() => this.translate(key, params))
  }

  // 创建Vue指令
  directive(app) {
    app.directive('i18n', {
      mounted: (el, binding) => {
        const key = binding.value
        const params = binding.arg || {}
        el.textContent = this.translate(key, params)

        // 监听语言变更
        eventBus.on('language:change', () => {
          el.textContent = this.translate(key, params)
        })
      },
      updated: (el, binding) => {
        const key = binding.value
        const params = binding.arg || {}
        el.textContent = this.translate(key, params)
      }
    })
  }

  // 格式化日期
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date)
    return new Intl.DateTimeFormat(this.currentLanguage.value).format(d)
  }

  // 格式化数字
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLanguage.value, options).format(number)
  }

  // 格式化货币
  formatCurrency(amount, currency = 'CNY') {
    return new Intl.NumberFormat(this.currentLanguage.value, {
      style: 'currency',
      currency
    }).format(amount)
  }

  // 格式化百分比
  formatPercent(number, decimals = 0) {
    return new Intl.NumberFormat(this.currentLanguage.value, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  }
}

// 创建国际化服务实例
export const i18n = new I18nService()

// Vue插件
export const i18nPlugin = {
  install(app) {
    // 添加全局属性
    app.config.globalProperties.$t = (key, params) => i18n.translate(key, params)
    app.config.globalProperties.$d = (date, format) => i18n.formatDate(date, format)
    app.config.globalProperties.$n = (number, options) => i18n.formatNumber(number, options)
    app.config.globalProperties.$c = (amount, currency) => i18n.formatCurrency(amount, currency)
    app.config.globalProperties.$p = (number, decimals) => i18n.formatPercent(number, decimals)

    // 添加指令
    i18n.directive(app)

    // 添加组合式API
    app.provide('i18n', i18n)
  }
}

export default i18n 