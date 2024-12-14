import { ref, computed } from 'vue'
import { eventBus } from '@/services/event-bus'
import { logger } from '@/services/logger'
import { storage } from '@/services/storage'

// 主题类型枚举
export const ThemeType = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  CUSTOM: 'custom'
}

// 默认配置
const defaultConfig = {
  // 默认主题
  defaultTheme: ThemeType.SYSTEM,
  
  // 是否持久化
  persistent: true,
  
  // 存储键名
  storageKey: 'theme',
  
  // 是否自动跟随系统
  followSystem: true,
  
  // 是否启用过渡动画
  transition: true,
  
  // 过渡动画持续时间（毫秒）
  transitionDuration: 300,
  
  // 是否启用主题预览
  preview: true,
  
  // 预览持续时间（毫秒）
  previewDuration: 2000
}

// 默认主题变量
const defaultVariables = {
  [ThemeType.LIGHT]: {
    // 颜色
    '--color-primary': '#1890ff',
    '--color-success': '#52c41a',
    '--color-warning': '#faad14',
    '--color-error': '#f5222d',
    '--color-info': '#1890ff',
    
    // 背景色
    '--bg-color-primary': '#ffffff',
    '--bg-color-secondary': '#f5f5f5',
    '--bg-color-tertiary': '#f0f2f5',
    
    // 文字颜色
    '--text-color-primary': '#262626',
    '--text-color-secondary': '#595959',
    '--text-color-tertiary': '#8c8c8c',
    '--text-color-disabled': '#bfbfbf',
    
    // 边框颜色
    '--border-color': '#d9d9d9',
    '--border-color-split': '#f0f0f0',
    
    // 阴影
    '--box-shadow': '0 2px 8px rgba(0, 0, 0, 0.15)',
    
    // 圆角
    '--border-radius': '4px',
    '--border-radius-sm': '2px',
    '--border-radius-lg': '8px',
    
    // 字体
    '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    '--font-size-base': '14px',
    '--font-size-sm': '12px',
    '--font-size-lg': '16px',
    
    // 行高
    '--line-height-base': '1.5',
    '--line-height-sm': '1.2',
    '--line-height-lg': '1.8',
    
    // 间距
    '--spacing-unit': '4px',
    '--spacing-xs': '8px',
    '--spacing-sm': '12px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px'
  },
  
  [ThemeType.DARK]: {
    // 颜色
    '--color-primary': '#1890ff',
    '--color-success': '#52c41a',
    '--color-warning': '#faad14',
    '--color-error': '#f5222d',
    '--color-info': '#1890ff',
    
    // 背景色
    '--bg-color-primary': '#1f1f1f',
    '--bg-color-secondary': '#141414',
    '--bg-color-tertiary': '#000000',
    
    // 文字颜色
    '--text-color-primary': '#ffffff',
    '--text-color-secondary': '#rgba(255, 255, 255, 0.85)',
    '--text-color-tertiary': '#rgba(255, 255, 255, 0.65)',
    '--text-color-disabled': '#rgba(255, 255, 255, 0.45)',
    
    // 边框颜色
    '--border-color': '#434343',
    '--border-color-split': '#303030',
    
    // 阴影
    '--box-shadow': '0 2px 8px rgba(0, 0, 0, 0.45)',
    
    // 其他变量保持不变
    '--border-radius': '4px',
    '--border-radius-sm': '2px',
    '--border-radius-lg': '8px',
    '--font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    '--font-size-base': '14px',
    '--font-size-sm': '12px',
    '--font-size-lg': '16px',
    '--line-height-base': '1.5',
    '--line-height-sm': '1.2',
    '--line-height-lg': '1.8',
    '--spacing-unit': '4px',
    '--spacing-xs': '8px',
    '--spacing-sm': '12px',
    '--spacing-md': '16px',
    '--spacing-lg': '24px',
    '--spacing-xl': '32px'
  }
}

class ThemeService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.variables = { ...defaultVariables }
    this.currentTheme = ref(this.getInitialTheme())
    this.systemTheme = ref(this.getSystemTheme())
    this.previewTimer = null
    
    // 计算当前生效的主题
    this.activeTheme = computed(() => {
      if (this.currentTheme.value === ThemeType.SYSTEM) {
        return this.systemTheme.value
      }
      return this.currentTheme.value
    })
    
    // 初始化
    this.init()
  }

  // 初始化
  init() {
    // 加载主题
    this.loadTheme()

    // 监听系统主题变化
    if (this.config.followSystem) {
      this.setupSystemThemeListener()
    }

    // 监听主题变化
    this.setupThemeChangeListener()
  }

  // 获取初始主题
  getInitialTheme() {
    // 从存储中获取
    if (this.config.persistent) {
      const stored = storage.get(this.config.storageKey)
      if (stored) return stored
    }

    return this.config.defaultTheme
  }

  // 获取系统主题
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return ThemeType.DARK
    }
    return ThemeType.LIGHT
  }

  // 设置主题监听器
  setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.systemTheme.value = e.matches ? ThemeType.DARK : ThemeType.LIGHT
      
      if (this.currentTheme.value === ThemeType.SYSTEM) {
        this.loadTheme()
      }
    })
  }

  // 设置主题变化监听器
  setupThemeChangeListener() {
    // 监听主题变化
    this.activeTheme.value && this.applyTheme(this.activeTheme.value)
  }

  // 加载主题
  loadTheme() {
    const theme = this.activeTheme.value
    this.applyTheme(theme)
  }

  // 应用主题
  applyTheme(theme) {
    const variables = this.variables[theme]
    if (!variables) return

    // 添加过渡动画
    if (this.config.transition) {
      document.documentElement.style.transition = `all ${this.config.transitionDuration}ms`
    }

    // 应用主题变量
    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value)
    })

    // 更新body类名
    document.body.className = `theme-${theme}`

    // 触发主题变更事件
    eventBus.emit('theme:change', {
      theme,
      variables
    })
  }

  // 切换主题
  setTheme(theme) {
    if (!this.variables[theme] && theme !== ThemeType.SYSTEM) {
      logger.error(`Theme ${theme} not found`)
      return false
    }

    this.currentTheme.value = theme

    // 持久化
    if (this.config.persistent) {
      storage.set(this.config.storageKey, theme)
    }

    return true
  }

  // 获取当前主题
  getTheme() {
    return this.currentTheme.value
  }

  // 获取当前生效的主题
  getActiveTheme() {
    return this.activeTheme.value
  }

  // 预览主题
  previewTheme(theme) {
    if (!this.config.preview) return

    // 清除之前的预览
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
    }

    // 保存当前主题
    const currentTheme = this.currentTheme.value

    // 应用预览主题
    this.setTheme(theme)

    // 设置预览定时器
    this.previewTimer = setTimeout(() => {
      // 恢复原主题
      this.setTheme(currentTheme)
      this.previewTimer = null
    }, this.config.previewDuration)
  }

  // 添加自定义主题
  addTheme(name, variables) {
    if (this.variables[name]) {
      logger.warn(`Theme ${name} already exists`)
      return false
    }

    this.variables[name] = {
      ...this.variables[ThemeType.LIGHT],
      ...variables
    }

    // 触发主题添加事件
    eventBus.emit('theme:add', {
      name,
      variables: this.variables[name]
    })

    return true
  }

  // 移除自定义主题
  removeTheme(name) {
    if (name === ThemeType.LIGHT || name === ThemeType.DARK) {
      logger.error('Cannot remove built-in theme')
      return false
    }

    if (!this.variables[name]) {
      logger.warn(`Theme ${name} not found`)
      return false
    }

    // 如果当前正在使用该主题，切换到默认主题
    if (this.currentTheme.value === name) {
      this.setTheme(this.config.defaultTheme)
    }

    delete this.variables[name]

    // 触发主题移除事件
    eventBus.emit('theme:remove', { name })

    return true
  }

  // 更新主题变量
  updateTheme(name, variables) {
    if (!this.variables[name]) {
      logger.warn(`Theme ${name} not found`)
      return false
    }

    this.variables[name] = {
      ...this.variables[name],
      ...variables
    }

    // 如果当前正在使用该主题，重新应用
    if (this.activeTheme.value === name) {
      this.applyTheme(name)
    }

    // 触发主题更新事件
    eventBus.emit('theme:update', {
      name,
      variables: this.variables[name]
    })

    return true
  }

  // 获取主题变量
  getThemeVariables(theme = this.activeTheme.value) {
    return this.variables[theme] || {}
  }

  // 获取所有主题
  getAllThemes() {
    return Object.keys(this.variables)
  }

  // 重置主题
  resetTheme() {
    this.setTheme(this.config.defaultTheme)
  }

  // 创建Vue插件
  plugin = {
    install(app) {
      // 添加全局属性
      app.config.globalProperties.$theme = this
      
      // 添加组合式API
      app.provide('theme', this)
    }
  }
}

// 创建主题服务实例
export const theme = new ThemeService()

export default theme 