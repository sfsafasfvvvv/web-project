import { io } from 'socket.io-client'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 事件类型枚举
export const EventType = {
  // 连接相关
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
  RECONNECT_ERROR: 'reconnect_error',
  RECONNECT_FAILED: 'reconnect_failed',
  
  // 消息相关
  MESSAGE: 'message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  
  // 通知相关
  NOTIFICATION: 'notification',
  NEW_FOLLOWER: 'new_follower',
  NEW_COMMENT: 'new_comment',
  NEW_LIKE: 'new_like',
  
  // 商品相关
  PRODUCT_UPDATE: 'product_update',
  PRODUCT_SOLD: 'product_sold',
  PRODUCT_DELETED: 'product_deleted',
  
  // 订单相关
  ORDER_STATUS: 'order_status',
  ORDER_CREATED: 'order_created',
  ORDER_PAID: 'order_paid',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_COMPLETED: 'order_completed',
  ORDER_CANCELLED: 'order_cancelled'
}

class SocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.reconnecting = false
    this.listeners = new Map()
    this.messageQueue = []
    this.options = {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: false
    }
  }

  // 初始化连接
  init() {
    if (this.socket) return

    const userStore = useUserStore()
    const token = userStore.token

    if (!token) {
      console.warn('Socket initialization failed: No token available')
      return
    }

    const baseURL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3001'

    this.socket = io(baseURL, {
      ...this.options,
      auth: {
        token
      }
    })

    this.bindEvents()
  }

  // 绑定基本事件
  bindEvents() {
    // 连接成功
    this.socket.on(EventType.CONNECT, () => {
      console.log('Socket connected')
      this.connected = true
      this.reconnecting = false
      this.flushMessageQueue()
      this.emit('join', useUserStore().user?.id)
    })

    // 断开连接
    this.socket.on(EventType.DISCONNECT, (reason) => {
      console.log('Socket disconnected:', reason)
      this.connected = false
    })

    // 重连中
    this.socket.on(EventType.RECONNECT_ATTEMPT, (attempt) => {
      console.log('Socket reconnecting... Attempt:', attempt)
      this.reconnecting = true
    })

    // 重连成功
    this.socket.on(EventType.RECONNECT, (attempt) => {
      console.log('Socket reconnected after', attempt, 'attempts')
      this.connected = true
      this.reconnecting = false
      this.flushMessageQueue()
    })

    // 重连失败
    this.socket.on(EventType.RECONNECT_FAILED, () => {
      console.error('Socket reconnection failed')
      this.reconnecting = false
      ElMessage.error('连接服务器失败，请刷新页面重试')
    })

    // 连接错误
    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      ElMessage.error('连接发生错误，请刷新页面重试')
    })
  }

  // 连接
  connect() {
    if (!this.socket) {
      this.init()
    }
    if (!this.connected) {
      this.socket.connect()
    }
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
  }

  // 重新连接
  reconnect() {
    this.disconnect()
    this.connect()
  }

  // 发送消息
  emit(event, data) {
    if (!this.socket || !this.connected) {
      this.messageQueue.push({ event, data })
      return
    }
    this.socket.emit(event, data)
  }

  // 监听事件
  on(event, callback) {
    if (!this.socket) return

    // 移除之前的监听器
    this.off(event)

    // 添加新的监听��
    this.socket.on(event, callback)
    this.listeners.set(event, callback)
  }

  // 移除监听
  off(event) {
    if (!this.socket) return

    const callback = this.listeners.get(event)
    if (callback) {
      this.socket.off(event, callback)
      this.listeners.delete(event)
    }
  }

  // 清空消息队列
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const { event, data } = this.messageQueue.shift()
      this.emit(event, data)
    }
  }

  // 获取连接状态
  getStatus() {
    return {
      connected: this.connected,
      reconnecting: this.reconnecting
    }
  }

  // 处理新消息
  onNewMessage(callback) {
    this.on(EventType.NEW_MESSAGE, callback)
  }

  // 处理消息已读
  onMessageRead(callback) {
    this.on(EventType.MESSAGE_READ, callback)
  }

  // 处理新通知
  onNotification(callback) {
    this.on(EventType.NOTIFICATION, callback)
  }

  // 处理新粉丝
  onNewFollower(callback) {
    this.on(EventType.NEW_FOLLOWER, callback)
  }

  // 处理新评论
  onNewComment(callback) {
    this.on(EventType.NEW_COMMENT, callback)
  }

  // 处理新点赞
  onNewLike(callback) {
    this.on(EventType.NEW_LIKE, callback)
  }

  // 处理商品更新
  onProductUpdate(callback) {
    this.on(EventType.PRODUCT_UPDATE, callback)
  }

  // 处理商品售出
  onProductSold(callback) {
    this.on(EventType.PRODUCT_SOLD, callback)
  }

  // 处理商品删除
  onProductDeleted(callback) {
    this.on(EventType.PRODUCT_DELETED, callback)
  }

  // 处理订单状态变更
  onOrderStatus(callback) {
    this.on(EventType.ORDER_STATUS, callback)
  }

  // 发送消息
  sendMessage(data) {
    this.emit(EventType.MESSAGE, data)
  }

  // 标记消息已读
  markMessageRead(data) {
    this.emit(EventType.MESSAGE_READ, data)
  }

  // 加入房间
  joinRoom(roomId) {
    this.emit('join_room', roomId)
  }

  // 离开房间
  leaveRoom(roomId) {
    this.emit('leave_room', roomId)
  }
}

// 创建Socket实例
export const socket = new SocketService()

export default socket 