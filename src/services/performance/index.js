import { logger } from '@/services/logger'

// 性能指标类型枚举
export const MetricType = {
  // 页面加载相关
  PAGE_LOAD: 'page_load',
  FIRST_PAINT: 'first_paint',
  FIRST_CONTENTFUL_PAINT: 'first_contentful_paint',
  LARGEST_CONTENTFUL_PAINT: 'largest_contentful_paint',
  FIRST_INPUT_DELAY: 'first_input_delay',
  CUMULATIVE_LAYOUT_SHIFT: 'cumulative_layout_shift',
  
  // 资源加载相关
  RESOURCE_LOAD: 'resource_load',
  RESOURCE_ERROR: 'resource_error',
  
  // API请求相关
  API_REQUEST: 'api_request',
  API_RESPONSE: 'api_response',
  API_ERROR: 'api_error',
  
  // 用户交互相关
  USER_INTERACTION: 'user_interaction',
  LONG_TASK: 'long_task',
  
  // 内存相关
  MEMORY_USAGE: 'memory_usage',
  
  // 自定义指标
  CUSTOM: 'custom'
}

// 性能监控配置
const defaultConfig = {
  // 是否启用性能监控
  enabled: true,
  
  // 采样率（0-1）
  sampleRate: 1,
  
  // 是否监控页面加载性能
  pageLoad: true,
  
  // 是否监控资源加载性能
  resourceLoad: true,
  
  // 是否监控API请求性能
  apiRequest: true,
  
  // 是否监控用户交��性能
  userInteraction: true,
  
  // 是否监控长任务
  longTask: true,
  
  // 是否监控内存使用
  memoryUsage: true,
  
  // 长任务阈值（毫秒）
  longTaskThreshold: 50,
  
  // 内存使用警告阈值（MB）
  memoryWarningThreshold: 100,
  
  // 性能数据上报地址
  reportUrl: '',
  
  // 上报间隔（毫秒）
  reportInterval: 60000,
  
  // 是否在控制台输出
  console: true
}

class PerformanceService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.metrics = new Map()
    this.observers = new Map()
    
    if (this.config.enabled) {
      this.init()
    }
  }

  // 初始化
  init() {
    // 监控页面加载性能
    if (this.config.pageLoad) {
      this.observePageLoad()
    }

    // 监控资源加载性能
    if (this.config.resourceLoad) {
      this.observeResourceLoad()
    }

    // 监控用户交互性能
    if (this.config.userInteraction) {
      this.observeUserInteraction()
    }

    // 监控长任务
    if (this.config.longTask) {
      this.observeLongTask()
    }

    // 监控内存使用
    if (this.config.memoryUsage) {
      this.observeMemoryUsage()
    }

    // 定时上报性能数据
    if (this.config.reportUrl) {
      this.startReporting()
    }
  }

  // ��控页面加载性能
  observePageLoad() {
    // 使用Performance API获取页面加载指标
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(MetricType.PAGE_LOAD, {
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        })
      }
    })

    observer.observe({ entryTypes: ['navigation'] })
    this.observers.set('pageLoad', observer)

    // 监控关键渲染指标
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          this.recordMetric(MetricType.FIRST_PAINT, {
            duration: entry.startTime
          })
        } else if (entry.name === 'first-contentful-paint') {
          this.recordMetric(MetricType.FIRST_CONTENTFUL_PAINT, {
            duration: entry.startTime
          })
        }
      }
    })

    paintObserver.observe({ entryTypes: ['paint'] })
    this.observers.set('paint', paintObserver)

    // 监控最大内容渲染时间
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric(MetricType.LARGEST_CONTENTFUL_PAINT, {
        duration: lastEntry.startTime
      })
    })

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.set('lcp', lcpObserver)

    // 监控首次输入延迟
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(MetricType.FIRST_INPUT_DELAY, {
          duration: entry.processingStart - entry.startTime
        })
      }
    })

    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.set('fid', fidObserver)

    // 监控累积布局偏移
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(MetricType.CUMULATIVE_LAYOUT_SHIFT, {
          value: entry.value
        })
      }
    })

    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.set('cls', clsObserver)
  }

  // 监控资源加载性能
  observeResourceLoad() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'xmlhttprequest' || entry.initiatorType === 'fetch') {
          // API请求性能
          if (this.config.apiRequest) {
            this.recordMetric(MetricType.API_REQUEST, {
              url: entry.name,
              duration: entry.duration,
              size: entry.transferSize
            })
          }
        } else {
          // 其他资源加载性能
          this.recordMetric(MetricType.RESOURCE_LOAD, {
            url: entry.name,
            type: entry.initiatorType,
            duration: entry.duration,
            size: entry.transferSize
          })
        }
      }
    })

    observer.observe({ entryTypes: ['resource'] })
    this.observers.set('resource', observer)
  }

  // 监控用户交互性能
  observeUserInteraction() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(MetricType.USER_INTERACTION, {
          type: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        })
      }
    })

    observer.observe({ entryTypes: ['measure'] })
    this.observers.set('interaction', observer)

    // 记录用户交互
    const measureInteraction = (name) => {
      performance.mark(`${name}-start`)
      return () => {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
      }
    }

    // 监听点击事件
    document.addEventListener('click', () => {
      const endMeasure = measureInteraction('click')
      setTimeout(endMeasure, 0)
    })

    // 监听滚动事件
    let scrollTimeout
    document.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        const endMeasure = measureInteraction('scroll')
        scrollTimeout = setTimeout(() => {
          endMeasure()
          scrollTimeout = null
        }, 100)
      }
    })
  }

  // 监控长任务
  observeLongTask() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > this.config.longTaskThreshold) {
          this.recordMetric(MetricType.LONG_TASK, {
            duration: entry.duration,
            startTime: entry.startTime
          })
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })
    this.observers.set('longTask', observer)
  }

  // 监控内存使用
  observeMemoryUsage() {
    if (!performance.memory) return

    const checkMemory = () => {
      const memory = performance.memory
      const usage = {
        total: memory.totalJSHeapSize / (1024 * 1024),
        used: memory.usedJSHeapSize / (1024 * 1024),
        limit: memory.jsHeapSizeLimit / (1024 * 1024)
      }

      this.recordMetric(MetricType.MEMORY_USAGE, usage)

      // 内存使用警告
      if (usage.used > this.config.memoryWarningThreshold) {
        logger.warn('High memory usage', usage)
      }
    }

    // 定期检查内存使用
    setInterval(checkMemory, 60000)
  }

  // 记录性能指标
  recordMetric(type, data) {
    // 采样判断
    if (Math.random() > this.config.sampleRate) {
      return
    }

    const metric = {
      type,
      timestamp: Date.now(),
      data
    }

    // 添加到指标集合
    if (!this.metrics.has(type)) {
      this.metrics.set(type, [])
    }
    this.metrics.get(type).push(metric)

    // 控制台输出
    if (this.config.console) {
      logger.debug('Performance metric', metric)
    }
  }

  // 开始定时上报
  startReporting() {
    setInterval(() => {
      this.report()
    }, this.config.reportInterval)
  }

  // 上报性能数据
  async report() {
    if (!this.config.reportUrl || this.metrics.size === 0) return

    try {
      const metrics = {}
      this.metrics.forEach((value, key) => {
        metrics[key] = value
      })

      await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timestamp: Date.now(),
          metrics
        })
      })

      // 清空已上报的指标
      this.metrics.clear()
    } catch (error) {
      logger.error('Performance report error', error)
    }
  }

  // 获取性能指标
  getMetrics(type) {
    return type ? this.metrics.get(type) : Object.fromEntries(this.metrics)
  }

  // 清除性能指标
  clearMetrics(type) {
    if (type) {
      this.metrics.delete(type)
    } else {
      this.metrics.clear()
    }
  }

  // 停止监控
  stop() {
    this.observers.forEach(observer => {
      observer.disconnect()
    })
    this.observers.clear()
  }

  // 自定义性能标记
  mark(name) {
    performance.mark(name)
  }

  // 测量两个标记之间的性能
  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark)
  }

  // 记录自定义指标
  recordCustomMetric(name, value, data = {}) {
    this.recordMetric(MetricType.CUSTOM, {
      name,
      value,
      ...data
    })
  }
}

// 创建性能监控服务实例
export const performance = new PerformanceService()

export default performance 