import { useUserStore } from '@/stores/user'
import { createError, ErrorCode } from '@/services/error'

// 权限类型枚举
export const PermissionType = {
  // 用户权限
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // 商品权限
  PRODUCT_VIEW: 'product:view',
  PRODUCT_CREATE: 'product:create',
  PRODUCT_EDIT: 'product:edit',
  PRODUCT_DELETE: 'product:delete',
  
  // 订单权限
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_EDIT: 'order:edit',
  ORDER_DELETE: 'order:delete',
  
  // 评论权限
  COMMENT_VIEW: 'comment:view',
  COMMENT_CREATE: 'comment:create',
  COMMENT_EDIT: 'comment:edit',
  COMMENT_DELETE: 'comment:delete',
  
  // 消息权限
  MESSAGE_VIEW: 'message:view',
  MESSAGE_SEND: 'message:send',
  MESSAGE_DELETE: 'message:delete'
}

// 角色类型枚举
export const RoleType = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
}

// 角色权限映射
const rolePermissions = {
  [RoleType.ADMIN]: [
    // 管理员拥有所有权限
    ...Object.values(PermissionType)
  ],
  [RoleType.USER]: [
    // 普通用户权限
    PermissionType.USER_VIEW,
    PermissionType.USER_EDIT,
    PermissionType.PRODUCT_VIEW,
    PermissionType.PRODUCT_CREATE,
    PermissionType.PRODUCT_EDIT,
    PermissionType.PRODUCT_DELETE,
    PermissionType.ORDER_VIEW,
    PermissionType.ORDER_CREATE,
    PermissionType.ORDER_EDIT,
    PermissionType.COMMENT_VIEW,
    PermissionType.COMMENT_CREATE,
    PermissionType.COMMENT_EDIT,
    PermissionType.COMMENT_DELETE,
    PermissionType.MESSAGE_VIEW,
    PermissionType.MESSAGE_SEND,
    PermissionType.MESSAGE_DELETE
  ],
  [RoleType.GUEST]: [
    // 游客权限
    PermissionType.USER_VIEW,
    PermissionType.PRODUCT_VIEW,
    PermissionType.COMMENT_VIEW
  ]
}

class AuthService {
  constructor() {
    this.userStore = useUserStore()
  }

  // 获取当前用户角色
  getRole() {
    return this.userStore.user?.role || RoleType.GUEST
  }

  // 获取当前用户权限
  getPermissions() {
    const role = this.getRole()
    return rolePermissions[role] || []
  }

  // 检查是否有权限
  hasPermission(permission) {
    const permissions = this.getPermissions()
    return permissions.includes(permission)
  }

  // 检查是否有任意一个权限
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission))
  }

  // 检查是否有所有权��
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission))
  }

  // 检查是否为管理员
  isAdmin() {
    return this.getRole() === RoleType.ADMIN
  }

  // 检查是否为普通用户
  isUser() {
    return this.getRole() === RoleType.USER
  }

  // 检查是否为游客
  isGuest() {
    return this.getRole() === RoleType.GUEST
  }

  // 检查是否已登录
  isAuthenticated() {
    return !!this.userStore.token
  }

  // 检查是否为资源所有者
  isOwner(resourceUserId) {
    return this.userStore.user?.id === resourceUserId
  }

  // 验证权限
  validatePermission(permission) {
    if (!this.hasPermission(permission)) {
      throw createError(ErrorCode.FORBIDDEN)
    }
  }

  // 验证任意一个权限
  validateAnyPermission(permissions) {
    if (!this.hasAnyPermission(permissions)) {
      throw createError(ErrorCode.FORBIDDEN)
    }
  }

  // 验证所有权限
  validateAllPermissions(permissions) {
    if (!this.hasAllPermissions(permissions)) {
      throw createError(ErrorCode.FORBIDDEN)
    }
  }

  // 验证是否已登录
  validateAuthenticated() {
    if (!this.isAuthenticated()) {
      throw createError(ErrorCode.UNAUTHORIZED)
    }
  }

  // 验证是否为资源所有者
  validateOwner(resourceUserId) {
    if (!this.isOwner(resourceUserId)) {
      throw createError(ErrorCode.FORBIDDEN)
    }
  }

  // 验证是否为管理员
  validateAdmin() {
    if (!this.isAdmin()) {
      throw createError(ErrorCode.FORBIDDEN)
    }
  }

  // 检查商品权限
  checkProductPermission(product, action) {
    switch (action) {
      case 'view':
        return true // 所有人都可以查看商品
      case 'create':
        return this.hasPermission(PermissionType.PRODUCT_CREATE)
      case 'edit':
      case 'delete':
        return this.isAdmin() || this.isOwner(product.userId)
      default:
        return false
    }
  }

  // 检查订单权限
  checkOrderPermission(order, action) {
    switch (action) {
      case 'view':
        return this.isAdmin() || 
               this.isOwner(order.buyerId) || 
               this.isOwner(order.sellerId)
      case 'create':
        return this.hasPermission(PermissionType.ORDER_CREATE)
      case 'edit':
        return this.isAdmin() || 
               this.isOwner(order.buyerId) || 
               this.isOwner(order.sellerId)
      case 'delete':
        return this.isAdmin()
      default:
        return false
    }
  }

  // 检查评论权限
  checkCommentPermission(comment, action) {
    switch (action) {
      case 'view':
        return true // 所有人���可以查看评论
      case 'create':
        return this.hasPermission(PermissionType.COMMENT_CREATE)
      case 'edit':
      case 'delete':
        return this.isAdmin() || this.isOwner(comment.userId)
      default:
        return false
    }
  }

  // 检查消息权限
  checkMessagePermission(message, action) {
    switch (action) {
      case 'view':
        return this.isAdmin() || 
               this.isOwner(message.senderId) || 
               this.isOwner(message.receiverId)
      case 'send':
        return this.hasPermission(PermissionType.MESSAGE_SEND)
      case 'delete':
        return this.isAdmin() || 
               this.isOwner(message.senderId) || 
               this.isOwner(message.receiverId)
      default:
        return false
    }
  }
}

// 创建权限服务实例
export const auth = new AuthService()

// Vue指令
export const vPermission = {
  mounted(el, binding) {
    const { value } = binding
    const hasPermission = auth.hasPermission(value)
    
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 路由守卫中间件
export const authGuard = (to, from, next) => {
  const { requiresAuth, permissions = [] } = to.meta

  // 检查是否需要登录
  if (requiresAuth && !auth.isAuthenticated()) {
    next({
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // 检查是否有必要权限
  if (permissions.length > 0 && !auth.hasAllPermissions(permissions)) {
    next({ name: '403' })
    return
  }

  next()
}

export default auth 