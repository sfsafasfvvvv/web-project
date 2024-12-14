import { ref, computed } from 'vue'
import { eventBus } from '@/services/event-bus'
import { logger } from '@/services/logger'
import { auth } from '@/services/auth'

// 权限类型枚举
export const PermissionType = {
  // 系统权限
  SYSTEM: 'system',
  
  // 功能权限
  FEATURE: 'feature',
  
  // 数据权限
  DATA: 'data',
  
  // 操作权限
  ACTION: 'action'
}

// 权限级别枚举
export const PermissionLevel = {
  NONE: 0,      // 无权限
  READ: 1,      // 只读权限
  WRITE: 2,     // 写入权限
  MANAGE: 3,    // 管理权限
  ADMIN: 4      // 管理员权限
}

// 默认配置
const defaultConfig = {
  // 是否启用严格模式
  strict: true,
  
  // 是否缓存权限
  cache: true,
  
  // 缓存过期时间（毫秒）
  cacheExpiration: 30 * 60 * 1000, // 30分钟
  
  // 默认权限级别
  defaultLevel: PermissionLevel.NONE,
  
  // 是否自动更新权限
  autoUpdate: true,
  
  // 自动更新间隔（毫秒）
  autoUpdateInterval: 5 * 60 * 1000, // 5分钟
  
  // 是否启用权限继承
  inheritance: true
}

class PermissionService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.permissions = ref(new Map())
    this.roles = ref(new Map())
    this.cache = new Map()
    this.updateTimer = null
    
    // 初始化
    this.init()
  }

  // 初始化
  async init() {
    // 加载权限数据
    await this.loadPermissions()

    // 启动自动更新
    if (this.config.autoUpdate) {
      this.startAutoUpdate()
    }

    // 监听用户状态变化
    auth.onStateChange((user) => {
      if (user) {
        this.loadUserPermissions(user)
      } else {
        this.clearPermissions()
      }
    })
  }

  // 启动自动更新
  startAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.loadPermissions()
    }, this.config.autoUpdateInterval)
  }

  // 停止自动更新
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  // 加载权限数据
  async loadPermissions() {
    try {
      // TODO: 从服务器获取权限数据
      const data = await this.fetchPermissions()
      
      // 更新权限数据
      this.permissions.value = new Map(Object.entries(data.permissions))
      this.roles.value = new Map(Object.entries(data.roles))
      
      // 触发更新事件
      eventBus.emit('permission:update')
      
      return true
    } catch (error) {
      logger.error('Load permissions error:', error)
      return false
    }
  }

  // 加载用户权限
  async loadUserPermissions(user) {
    try {
      // TODO: 从服务器获取用户权限数据
      const data = await this.fetchUserPermissions(user.id)
      
      // 更新用户权限
      user.permissions = data.permissions
      user.roles = data.roles
      
      // 触发更新事件
      eventBus.emit('permission:user:update', user)
      
      return true
    } catch (error) {
      logger.error('Load user permissions error:', error)
      return false
    }
  }

  // 检查权限
  check(permission, level = PermissionLevel.READ) {
    // 检查缓存
    if (this.config.cache) {
      const cacheKey = `${permission}:${level}`
      const cached = this.cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.config.cacheExpiration) {
        return cached.result
      }
    }

    // 获取当前用户
    const user = auth.getCurrentUser()
    if (!user) return false

    // 检查是否是管理员
    if (this.isAdmin(user)) return true

    // 检查用户权限
    const hasPermission = this.checkUserPermission(user, permission, level)
    
    // 检查角色权限
    const hasRolePermission = this.checkRolePermission(user, permission, level)

    const result = hasPermission || hasRolePermission

    // 更新缓存
    if (this.config.cache) {
      const cacheKey = `${permission}:${level}`
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      })
    }

    return result
  }

  // 检查用户权限
  checkUserPermission(user, permission, level) {
    const userPermission = user.permissions?.[permission]
    if (!userPermission) return false

    return userPermission >= level
  }

  // 检查角色权限
  checkRolePermission(user, permission, level) {
    if (!user.roles?.length) return false

    return user.roles.some(role => {
      const rolePermissions = this.roles.value.get(role)
      if (!rolePermissions) return false

      const rolePermission = rolePermissions[permission]
      if (!rolePermission) return false

      return rolePermission >= level
    })
  }

  // 检查是否是管理员
  isAdmin(user) {
    return user.roles?.includes('admin')
  }

  // 获取用户权限列表
  getUserPermissions(user = auth.getCurrentUser()) {
    if (!user) return new Map()

    const permissions = new Map()

    // 合并用户权限
    if (user.permissions) {
      Object.entries(user.permissions).forEach(([key, value]) => {
        permissions.set(key, value)
      })
    }

    // 合并角色权限
    if (user.roles) {
      user.roles.forEach(role => {
        const rolePermissions = this.roles.value.get(role)
        if (rolePermissions) {
          Object.entries(rolePermissions).forEach(([key, value]) => {
            if (!permissions.has(key) || permissions.get(key) < value) {
              permissions.set(key, value)
            }
          })
        }
      })
    }

    return permissions
  }

  // 获取用户角色列表
  getUserRoles(user = auth.getCurrentUser()) {
    return user?.roles || []
  }

  // 添加权限
  addPermission(type, name, options = {}) {
    const permission = {
      type,
      name,
      level: options.level || this.config.defaultLevel,
      description: options.description || '',
      dependencies: options.dependencies || [],
      metadata: options.metadata || {}
    }

    this.permissions.value.set(name, permission)
    
    // 触发更新事件
    eventBus.emit('permission:add', permission)
  }

  // 移除权限
  removePermission(name) {
    const permission = this.permissions.value.get(name)
    if (!permission) return false

    this.permissions.value.delete(name)
    
    // 触发更新事件
    eventBus.emit('permission:remove', permission)
    
    return true
  }

  // 添加角色
  addRole(name, permissions = {}, options = {}) {
    const role = {
      name,
      permissions,
      description: options.description || '',
      metadata: options.metadata || {}
    }

    this.roles.value.set(name, role)
    
    // 触发更新事件
    eventBus.emit('role:add', role)
  }

  // 移除角色
  removeRole(name) {
    const role = this.roles.value.get(name)
    if (!role) return false

    this.roles.value.delete(name)
    
    // 触发更新事件
    eventBus.emit('role:remove', role)
    
    return true
  }

  // 更新角色权限
  updateRolePermissions(role, permissions) {
    const roleData = this.roles.value.get(role)
    if (!roleData) return false

    roleData.permissions = {
      ...roleData.permissions,
      ...permissions
    }

    // 触发更新事件
    eventBus.emit('role:update', roleData)
    
    return true
  }

  // 清除权限数据
  clearPermissions() {
    this.permissions.value.clear()
    this.roles.value.clear()
    this.cache.clear()
    
    // 触发更新事件
    eventBus.emit('permission:clear')
  }

  // 从服务器获取权限数据
  async fetchPermissions() {
    // TODO: 实现从服务器获取权限数据的逻辑
    return {
      permissions: {},
      roles: {}
    }
  }

  // 从服务器获取用户权限数据
  async fetchUserPermissions(userId) {
    // TODO: 实现从服务器获取用户权限数据的逻辑
    return {
      permissions: {},
      roles: []
    }
  }

  // 创建Vue指令
  directive(app) {
    // v-permission 指令
    app.directive('permission', {
      mounted: (el, binding) => {
        const permission = binding.value
        const level = binding.arg || PermissionLevel.READ
        
        if (!this.check(permission, level)) {
          el.style.display = 'none'
        }
      },
      updated: (el, binding) => {
        const permission = binding.value
        const level = binding.arg || PermissionLevel.READ
        
        el.style.display = this.check(permission, level) ? '' : 'none'
      }
    })
  }

  // 创建Vue插件
  plugin = {
    install(app) {
      // 添加全局属性
      app.config.globalProperties.$permission = this
      
      // 添加指令
      this.directive(app)
      
      // 添加组合式API
      app.provide('permission', this)
    }
  }
}

// 创建权限服务实例
export const permission = new PermissionService()

export default permission 