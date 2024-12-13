import { ElNotification } from 'element-plus'
import { socket } from '@/services/socket'
import { localStorage } from '@/services/storage'

// 通知类型枚举
export const NotificationType = {
  // 系统通知
  SYSTEM: 'system',
  
  // 用户通知
  USER_FOLLOW: 'user_follow',
  USER_UNFOLLOW: 'user_unfollow',
  
  // 商品通知
  PRODUCT_LIKE: 'product_like',
  PRODUCT_COMMENT: 'product_comment',
  PRODUCT_SOLD: 'product_sold',
  
  // 订单通知
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled',
  
  // 消息通知
  MESSAGE_RECEIVED: 'message_received'
}

// 通知优先级枚举
export const NotificationPriority = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
}

// 通知配置
const defaultConfig = {
  // 存储键名
  storageKey: 'notifications',
  
  // 最大存储数量
  maxCount: 100,
  
  // 默认配置
  duration: 4500,
  showClose: true,
  position: 'top-right'
}

class NotificationService {
  constructor(config = {}) {
    this.config = { ...defaultConfig, ...config }
    this.notifications = this.loadNotifications()
    this.setupSocketListeners()
  }

  // 加载通知列表
  loadNotifications() {
    return localStorage.get(this.config.storageKey) || []
  }

  // 保存通知列表
  saveNotifications() {
    // 限制最大存储数量
    if (this.notifications.length > this.config.maxCount) {
      this.notifications = this.notifications.slice(-this.config.maxCount)
    }
    localStorage.set(this.config.storageKey, this.notifications)
  }

  // 设置Socket监听
  setupSocketListeners() {
    // 监听新通知
    socket.on('notification', (notification) => {
      this.handleNotification(notification)
    })
  }

  // 处理通知
  handleNotification(notification) {
    // 添加到通知列表
    this.addNotification(notification)
    
    // 显示通知
    this.showNotification(notification)
  }

  // 添加通知
  addNotification(notification) {
    this.notifications.push({
      ...notification,
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString()
    })
    this.saveNotifications()
  }

  // 显示通知
  showNotification(notification) {
    const { title, message, type, duration, showClose, position } = this.getNotificationConfig(notification)
    
    ElNotification({
      title,
      message,
      type,
      duration,
      showClose,
      position
    })
  }

  // 获取通知配置
  getNotificationConfig(notification) {
    const config = {
      title: this.getNotificationTitle(notification),
      message: notification.message,
      type: this.getNotificationType(notification),
      duration: this.getNotificationDuration(notification),
      showClose: this.config.showClose,
      position: this.config.position
    }

    // 根据优先级调整配置
    if (notification.priority === NotificationPriority.HIGH) {
      config.duration = 0 // 不自动关闭
      config.showClose = true
    }

    return config
  }

  // 获取通知标题
  getNotificationTitle(notification) {
    switch (notification.type) {
      case NotificationType.SYSTEM:
        return '系统通知'
      case NotificationType.USER_FOLLOW:
        return '新粉丝'
      case NotificationType.USER_UNFOLLOW:
        return '取消关注'
      case NotificationType.PRODUCT_LIKE:
        return '商品点赞'
      case NotificationType.PRODUCT_COMMENT:
        return '商品评论'
      case NotificationType.PRODUCT_SOLD:
        return '商品售出'
      case NotificationType.ORDER_CREATED:
        return '新订单'
      case NotificationType.ORDER_PAID:
        return '订单支付'
      case NotificationType.ORDER_SHIPPED:
        return '订单发货'
      case NotificationType.ORDER_COMPLETED:
        return '订单完成'
      case NotificationType.ORDER_CANCELLED:
        return '订单取消'
      case NotificationType.MESSAGE_RECEIVED:
        return '新消息'
      default:
        return '通知'
    }
  }

  // 获取通知类型
  getNotificationType(notification) {
    switch (notification.priority) {
      case NotificationPriority.HIGH:
        return 'error'
      case NotificationPriority.NORMAL:
        return 'warning'
      case NotificationPriority.LOW:
        return 'info'
      default:
        return 'info'
    }
  }

  // 获取通知持续时间
  getNotificationDuration(notification) {
    switch (notification.priority) {
      case NotificationPriority.HIGH:
        return 0 // 不自动关闭
      case NotificationPriority.NORMAL:
        return this.config.duration
      case NotificationPriority.LOW:
        return this.config.duration / 2
      default:
        return this.config.duration
    }
  }

  // 获取所有通知
  getNotifications() {
    return this.notifications
  }

  // 获取未读通知
  getUnreadNotifications() {
    return this.notifications.filter(notification => !notification.read)
  }

  // 获取未读通知数量
  getUnreadCount() {
    return this.getUnreadNotifications().length
  }

  // 标记通知为已读
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
    }
  }

  // 标记所有通知为已读
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true
    })
    this.saveNotifications()
  }

  // 删除通知
  removeNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    this.saveNotifications()
  }

  // 清空所有通知
  clearAll() {
    this.notifications = []
    this.saveNotifications()
  }

  // 发送系统通知
  sendSystemNotification(message, priority = NotificationPriority.NORMAL) {
    this.handleNotification({
      type: NotificationType.SYSTEM,
      message,
      priority
    })
  }

  // 发送用户关注通知
  sendFollowNotification(user) {
    this.handleNotification({
      type: NotificationType.USER_FOLLOW,
      message: `${user.username} 关注了你`,
      priority: NotificationPriority.NORMAL,
      data: { userId: user.id }
    })
  }

  // 发送商品点赞通知
  sendProductLikeNotification(user, product) {
    this.handleNotification({
      type: NotificationType.PRODUCT_LIKE,
      message: `${user.username} 点赞了你的商品 ${product.title}`,
      priority: NotificationPriority.LOW,
      data: { userId: user.id, productId: product.id }
    })
  }

  // 发送商品评论通知
  sendProductCommentNotification(user, product) {
    this.handleNotification({
      type: NotificationType.PRODUCT_COMMENT,
      message: `${user.username} 评论了你的商品 ${product.title}`,
      priority: NotificationPriority.NORMAL,
      data: { userId: user.id, productId: product.id }
    })
  }

  // 发送订单状态变更通知
  sendOrderStatusNotification(order, status) {
    const notifications = {
      [NotificationType.ORDER_CREATED]: {
        message: `订单 ${order.orderNo} 已创建`,
        priority: NotificationPriority.NORMAL
      },
      [NotificationType.ORDER_PAID]: {
        message: `订单 ${order.orderNo} 已支付`,
        priority: NotificationPriority.NORMAL
      },
      [NotificationType.ORDER_SHIPPED]: {
        message: `订单 ${order.orderNo} 已发货`,
        priority: NotificationPriority.NORMAL
      },
      [NotificationType.ORDER_COMPLETED]: {
        message: `订单 ${order.orderNo} 已完成`,
        priority: NotificationPriority.NORMAL
      },
      [NotificationType.ORDER_CANCELLED]: {
        message: `订单 ${order.orderNo} 已取消`,
        priority: NotificationPriority.HIGH
      }
    }

    const notification = notifications[status]
    if (notification) {
      this.handleNotification({
        type: status,
        ...notification,
        data: { orderId: order.id }
      })
    }
  }

  // 发送新消息通知
  sendMessageNotification(message) {
    this.handleNotification({
      type: NotificationType.MESSAGE_RECEIVED,
      message: `${message.sender.username}: ${message.content}`,
      priority: NotificationPriority.NORMAL,
      data: { messageId: message.id, senderId: message.sender.id }
    })
  }
}

// 创建通知服务实例
export const notification = new NotificationService()

export default notification 