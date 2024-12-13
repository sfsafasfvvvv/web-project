import { auth } from '@/services/auth'
import { logger } from '@/services/logger'
import { notification } from '@/services/notification'
import { performance } from '@/services/performance'

// 路由类型枚举
export const RouteType = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  ADMIN: 'admin'
}

// 路由守卫配置
const defaultConfig = {
  // 登录页路由名称
  loginRouteName: 'login',
  
  // 首页路由名称
  homeRouteName: 'home',
  
  // 403页面路由名称
  forbiddenRouteName: '403',
  
  // 404页面路由名称
  notFoundRouteName: '404',
  
  // 是否记录路由历史
  history: true,
  
  // 历史记录最大数量
  historyMaxLength: 50,
  
  // 是否启用性能监控
  performance: true,
  
  // 是否启用路由切换进度条
  progressBar: true
}

class RouterGuardService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.history = []
    this.pendingNavigation = null
  }

  // 注册路由守卫
  register(router) {
    this.router = router

    // 全局前置守卫
    router.beforeEach(async (to, from, next) => {
      try {
        // 记录导航开始时间
        if (this.config.performance) {
          performance.mark('navigation-start')
        }

        // 保存待处理的导航
        this.pendingNavigation = { to, from, next }

        // 检查路由是否存在
        if (!to.matched.length) {
          return this.handleNotFound(to, from, next)
        }

        // 检查路由权限
        const allowed = await this.checkRoutePermission(to)
        if (!allowed) {
          return this.handleForbidden(to, from, next)
        }

        // 记录路由历史
        if (this.config.history) {
          this.addToHistory(to)
        }

        // 继续导航
        next()
      } catch (error) {
        logger.error('Navigation error', {
          to,
          from,
          error
        })
        next(false)
      }
    })

    // 全局后置钩子
    router.afterEach((to, from) => {
      // 清除待处理的导航
      this.pendingNavigation = null

      // 记录导航完成时间
      if (this.config.performance) {
        performance.mark('navigation-end')
        performance.measure(
          'navigation',
          'navigation-start',
          'navigation-end'
        )
      }

      // 记录路由切换
      logger.info('Route changed', {
        from: from.fullPath,
        to: to.fullPath
      })
    })

    // 路由错误处理
    router.onError((error) => {
      logger.error('Route error', error)
      
      // 显示错误通知
      notification.sendSystemNotification(
        '页面加载失败，请刷新重试',
        'error'
      )

      // 如果有待处理的导航，返回上一页
      if (this.pendingNavigation) {
        this.pendingNavigation.next(false)
        this.pendingNavigation = null
      }
    })
  }

  // 检查路由权限
  async checkRoutePermission(route) {
    // 获取路由类型
    const routeType = this.getRouteType(route)

    switch (routeType) {
      case RouteType.PUBLIC:
        return true

      case RouteType.PRIVATE:
        // 检查是否已登录
        if (!auth.isAuthenticated()) {
          // 保存原始路由
          this.saveTargetRoute(route)
          return false
        }
        // 检查路由权限
        return this.checkRouteAccess(route)

      case RouteType.ADMIN:
        // 检查是否为管理员
        if (!auth.isAdmin()) {
          return false
        }
        return true

      default:
        return true
    }
  }

  // 获取路由类型
  getRouteType(route) {
    if (route.meta?.admin) {
      return RouteType.ADMIN
    }
    if (route.meta?.requiresAuth) {
      return RouteType.PRIVATE
    }
    return RouteType.PUBLIC
  }

  // 检查路由访问权限
  checkRouteAccess(route) {
    // 检查是否需要特定权限
    const requiredPermissions = route.meta?.permissions
    if (requiredPermissions?.length) {
      return auth.hasAllPermissions(requiredPermissions)
    }
    return true
  }

  // 处理404错误
  handleNotFound(to, from, next) {
    logger.warn('Route not found', {
      path: to.fullPath
    })

    // 跳转到404页面
    next({
      name: this.config.notFoundRouteName,
      params: { pathMatch: to.path.substring(1).split('/') },
      query: to.query,
      hash: to.hash
    })
  }

  // 处理403错误
  handleForbidden(to, from, next) {
    logger.warn('Route forbidden', {
      path: to.fullPath
    })

    // 未登录用户跳转到登录页
    if (!auth.isAuthenticated()) {
      next({
        name: this.config.loginRouteName,
        query: { redirect: to.fullPath }
      })
    } else {
      // 已登录用户跳转到403页面
      next({
        name: this.config.forbiddenRouteName
      })
    }
  }

  // 保存目标路由
  saveTargetRoute(route) {
    if (route.name !== this.config.loginRouteName) {
      localStorage.setItem('targetRoute', JSON.stringify({
        name: route.name,
        params: route.params,
        query: route.query,
        hash: route.hash
      }))
    }
  }

  // 获取保存的目标路由
  getTargetRoute() {
    try {
      const targetRoute = localStorage.getItem('targetRoute')
      if (targetRoute) {
        return JSON.parse(targetRoute)
      }
    } catch (error) {
      logger.error('Get target route error', error)
    }
    return null
  }

  // 清除保存的目标路由
  clearTargetRoute() {
    localStorage.removeItem('targetRoute')
  }

  // 添加到路由历史
  addToHistory(route) {
    // 不记录登录页和错误页
    if ([
      this.config.loginRouteName,
      this.config.forbiddenRouteName,
      this.config.notFoundRouteName
    ].includes(route.name)) {
      return
    }

    const historyItem = {
      name: route.name,
      path: route.fullPath,
      title: route.meta?.title || '',
      timestamp: Date.now()
    }

    this.history.unshift(historyItem)

    // 限制历史记录数量
    if (this.history.length > this.config.historyMaxLength) {
      this.history.pop()
    }
  }

  // 获取路由历史
  getHistory() {
    return this.history
  }

  // 清除路由历史
  clearHistory() {
    this.history = []
  }

  // 返回上一页
  back() {
    if (this.history.length > 1) {
      this.router.back()
    } else {
      this.router.push({ name: this.config.homeRouteName })
    }
  }

  // 跳转到登录页
  goToLogin(redirect) {
    const query = redirect ? { redirect } : undefined
    this.router.push({
      name: this.config.loginRouteName,
      query
    })
  }

  // 跳转到首页
  goToHome() {
    this.router.push({ name: this.config.homeRouteName })
  }

  // 跳转到403页面
  goToForbidden() {
    this.router.push({ name: this.config.forbiddenRouteName })
  }

  // 跳转到404页面
  goToNotFound() {
    this.router.push({ name: this.config.notFoundRouteName })
  }

  // 获取当前路由信息
  getCurrentRoute() {
    return this.router.currentRoute.value
  }

  // 检查是否为当前路由
  isCurrentRoute(name, params) {
    const current = this.getCurrentRoute()
    if (current.name !== name) {
      return false
    }
    if (params) {
      return Object.keys(params).every(key => 
        current.params[key] === params[key]
      )
    }
    return true
  }

  // 解析路由
  resolve(to) {
    return this.router.resolve(to)
  }

  // 规范化路由
  normalize(to) {
    const resolved = this.resolve(to)
    return {
      name: resolved.name,
      path: resolved.path,
      hash: resolved.hash,
      query: resolved.query,
      params: resolved.params,
      fullPath: resolved.fullPath,
      matched: resolved.matched
    }
  }
}

// 创建路由守卫服务实例
export const routerGuard = new RouterGuardService()

export default routerGuard 