import { ref } from 'vue'
import { eventBus, EventType } from '@/services/event-bus'

// 加载状态类型枚举
export const LoadingType = {
  // 全局加载
  GLOBAL: 'global',
  
  // 页面加载
  PAGE: 'page',
  
  // 组件加载
  COMPONENT: 'component',
  
  // 请求加载
  REQUEST: 'request',
  
  // 操作加载
  ACTION: 'action'
}

// 加载配置
const defaultConfig = {
  // 默认延迟显示时间（毫秒）
  delay: 200,
  
  // 默认最小显示时间（毫秒）
  minDuration: 300,
  
  // 是否启用全局加载状态
  global: true,
  
  // 是否启用页面加载状态
  page: true,
  
  // 是否启用组件加载状态
  component: true,
  
  // 是否启用请求加载状态
  request: true,
  
  // 是否启用操作加载状态
  action: true
}

class LoadingService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    
    // 加载状态
    this.loadingStates = new Map()
    
    // 全局加载状态
    this.globalLoading = ref(false)
    
    // 页面加载状态
    this.pageLoading = ref(false)
    
    // 组件加载状态
    this.componentLoading = ref(false)
    
    // 请求加载状态
    this.requestLoading = ref(false)
    
    // 操作加载状态
    this.actionLoading = ref(false)
    
    // 加载计数器
    this.loadingCounter = new Map()
    
    // 加载定时器
    this.loadingTimers = new Map()
    
    // 初始化事件监听
    this.initEventListeners()
  }

  // 初始化事件监听
  initEventListeners() {
    // 监听路由变化
    eventBus.on(EventType.ROUTE_CHANGE, () => {
      this.startPageLoading()
    })

    // 监听请求开始
    eventBus.on('request:start', () => {
      this.startRequestLoading()
    })

    // 监听请求结束
    eventBus.on('request:end', () => {
      this.stopRequestLoading()
    })

    // 监听操作开始
    eventBus.on('action:start', () => {
      this.startActionLoading()
    })

    // 监听操作结束
    eventBus.on('action:end', () => {
      this.stopActionLoading()
    })
  }

  // 开始加载
  start(key, type = LoadingType.GLOBAL, options = {}) {
    const {
      delay = this.config.delay,
      minDuration = this.config.minDuration
    } = options

    // 增加计数器
    const counter = this.loadingCounter.get(key) || 0
    this.loadingCounter.set(key, counter + 1)

    // 如果已经在加载中，直接返回
    if (this.loadingStates.get(key)) {
      return
    }

    // 设置延迟定时器
    const timerId = setTimeout(() => {
      // 设置加载状态
      this.loadingStates.set(key, true)
      this.updateLoadingState(type, true)

      // 设置最小持续时间
      if (minDuration > 0) {
        const minDurationTimer = setTimeout(() => {
          if (this.loadingCounter.get(key) === 0) {
            this.stop(key, type)
          }
        }, minDuration)
        this.loadingTimers.set(`${key}_min`, minDurationTimer)
      }
    }, delay)

    this.loadingTimers.set(key, timerId)
  }

  // 停止加载
  stop(key, type = LoadingType.GLOBAL) {
    // 减少计数器
    const counter = this.loadingCounter.get(key) || 0
    if (counter > 0) {
      this.loadingCounter.set(key, counter - 1)
    }

    // 如果计数器不为0，说明还有其他加载任务
    if (this.loadingCounter.get(key) > 0) {
      return
    }

    // 清除定时器
    const timerId = this.loadingTimers.get(key)
    if (timerId) {
      clearTimeout(timerId)
      this.loadingTimers.delete(key)
    }

    const minDurationTimerId = this.loadingTimers.get(`${key}_min`)
    if (minDurationTimerId) {
      clearTimeout(minDurationTimerId)
      this.loadingTimers.delete(`${key}_min`)
    }

    // 清除加载状态
    this.loadingStates.delete(key)
    this.updateLoadingState(type, false)
  }

  // 更新加载状态
  updateLoadingState(type, value) {
    switch (type) {
      case LoadingType.GLOBAL:
        this.globalLoading.value = value
        break
      case LoadingType.PAGE:
        this.pageLoading.value = value
        break
      case LoadingType.COMPONENT:
        this.componentLoading.value = value
        break
      case LoadingType.REQUEST:
        this.requestLoading.value = value
        break
      case LoadingType.ACTION:
        this.actionLoading.value = value
        break
    }
  }

  // 开始全局加载
  startGlobalLoading(key = 'global', options = {}) {
    if (this.config.global) {
      this.start(key, LoadingType.GLOBAL, options)
    }
  }

  // 停止全局加载
  stopGlobalLoading(key = 'global') {
    if (this.config.global) {
      this.stop(key, LoadingType.GLOBAL)
    }
  }

  // 开始页面加载
  startPageLoading(key = 'page', options = {}) {
    if (this.config.page) {
      this.start(key, LoadingType.PAGE, options)
    }
  }

  // 停止页面加载
  stopPageLoading(key = 'page') {
    if (this.config.page) {
      this.stop(key, LoadingType.PAGE)
    }
  }

  // 开始组件加载
  startComponentLoading(key = 'component', options = {}) {
    if (this.config.component) {
      this.start(key, LoadingType.COMPONENT, options)
    }
  }

  // 停止组件加载
  stopComponentLoading(key = 'component') {
    if (this.config.component) {
      this.stop(key, LoadingType.COMPONENT)
    }
  }

  // 开始请求加载
  startRequestLoading(key = 'request', options = {}) {
    if (this.config.request) {
      this.start(key, LoadingType.REQUEST, options)
    }
  }

  // 停止请求加载
  stopRequestLoading(key = 'request') {
    if (this.config.request) {
      this.stop(key, LoadingType.REQUEST)
    }
  }

  // 开始操作加载
  startActionLoading(key = 'action', options = {}) {
    if (this.config.action) {
      this.start(key, LoadingType.ACTION, options)
    }
  }

  // 停止操作加载
  stopActionLoading(key = 'action') {
    if (this.config.action) {
      this.stop(key, LoadingType.ACTION)
    }
  }

  // 包装异步函数
  async wrap(fn, key, type = LoadingType.ACTION, options = {}) {
    try {
      this.start(key, type, options)
      return await fn()
    } finally {
      this.stop(key, type)
    }
  }

  // 包装Promise
  wrapPromise(promise, key, type = LoadingType.ACTION, options = {}) {
    this.start(key, type, options)
    return promise.finally(() => {
      this.stop(key, type)
    })
  }

  // 获取加载状态
  isLoading(key) {
    return this.loadingStates.get(key) || false
  }

  // 获取全局加载状态
  isGlobalLoading() {
    return this.globalLoading.value
  }

  // 获取页面加载状态
  isPageLoading() {
    return this.pageLoading.value
  }

  // 获取组件加载状态
  isComponentLoading() {
    return this.componentLoading.value
  }

  // 获取请求加载状态
  isRequestLoading() {
    return this.requestLoading.value
  }

  // 获取操作加载状态
  isActionLoading() {
    return this.actionLoading.value
  }

  // 清除所有加载状态
  clear() {
    // 清除计数器
    this.loadingCounter.clear()

    // 清除定时器
    for (const timerId of this.loadingTimers.values()) {
      clearTimeout(timerId)
    }
    this.loadingTimers.clear()

    // 清除加载状态
    this.loadingStates.clear()
    this.globalLoading.value = false
    this.pageLoading.value = false
    this.componentLoading.value = false
    this.requestLoading.value = false
    this.actionLoading.value = false
  }

  // 创建加载控制器
  createController(type = LoadingType.ACTION) {
    const key = Date.now().toString()
    return {
      start: (options = {}) => this.start(key, type, options),
      stop: () => this.stop(key, type),
      isLoading: () => this.isLoading(key)
    }
  }
}

// 创建加载状态管理��务实例
export const loading = new LoadingService()

// Vue指令
export const vLoading = {
  mounted(el, binding) {
    const key = binding.value || el.dataset.loading || 'component'
    const type = binding.arg || LoadingType.COMPONENT
    const options = binding.modifiers

    if (binding.value) {
      loading.start(key, type, options)
    }

    el._loading_key = key
    el._loading_type = type
  },
  updated(el, binding) {
    const key = el._loading_key
    const type = el._loading_type

    if (binding.value) {
      loading.start(key, type)
    } else {
      loading.stop(key, type)
    }
  },
  unmounted(el) {
    const key = el._loading_key
    const type = el._loading_type
    loading.stop(key, type)
  }
}

export default loading 