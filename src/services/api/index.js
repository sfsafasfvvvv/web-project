import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('Response error:', error)
    const { response } = error

    // 处理常见错误
    if (response) {
      switch (response.status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          router.push({
            name: 'login',
            query: { redirect: router.currentRoute.value.fullPath }
          })
          ElMessage.error('请先登录')
          break
        case 403:
          ElMessage.error('没有权限执行此操作')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接')
    }

    return Promise.reject(error)
  }
)

// 用户相关接口
export const userApi = {
  // 登录
  login: (data) => api.post('/auth/login', data),
  
  // 注册
  register: (data) => api.post('/auth/register', data),
  
  // 获取用户信息
  getUserInfo: (id) => api.get(`/users/${id}`),
  
  // 更新用户信息
  updateUserInfo: (id, data) => api.put(`/users/${id}`, data),
  
  // 更新用户头像
  updateAvatar: (data) => api.post('/users/avatar', data),
  
  // 获取用户关注列表
  getFollowing: (id, params) => api.get(`/users/${id}/following`, { params }),
  
  // 获取用户粉丝列表
  getFollowers: (id, params) => api.get(`/users/${id}/followers`, { params }),
  
  // 关注用户
  followUser: (id) => api.post(`/users/${id}/follow`),
  
  // 取消关注用户
  unfollowUser: (id) => api.delete(`/users/${id}/follow`),
  
  // 举报用户
  reportUser: (id, data) => api.post(`/users/${id}/report`, data)
}

// 商品相关接口
export const productApi = {
  // 获取商品列表
  getProducts: (params) => api.get('/products', { params }),
  
  // 获取商品详情
  getProduct: (id) => api.get(`/products/${id}`),
  
  // 发布商品
  createProduct: (data) => api.post('/products', data),
  
  // 更新商品
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // 删除商品
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  // 获取商品分类
  getCategories: () => api.get('/products/categories'),
  
  // 获取分类详情
  getCategory: (id) => api.get(`/products/categories/${id}`),
  
  // 收藏商品
  favoriteProduct: (id) => api.post(`/products/${id}/favorite`),
  
  // 取消收藏
  unfavoriteProduct: (id) => api.delete(`/products/${id}/favorite`),
  
  // 获取收藏列表
  getFavorites: (params) => api.get('/products/favorites', { params }),
  
  // 搜索商品
  searchProducts: (params) => api.get('/products/search', { params }),
  
  // 获取推荐商品
  getRecommendations: (params) => api.get('/products/recommendations', { params })
}

// 消息相关接口
export const messageApi = {
  // 获取消息列表
  getMessages: (params) => api.get('/messages', { params }),
  
  // 获取与特定用户的聊天记录
  getChatHistory: (userId, params) => api.get(`/messages/${userId}`, { params }),
  
  // 发送消息
  sendMessage: (data) => api.post('/messages', data),
  
  // 标记消息为已读
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  
  // 删除消息
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // 获取未读消息数
  getUnreadCount: () => api.get('/messages/unread/count')
}

// 订单相关接口
export const orderApi = {
  // 创建订单
  createOrder: (data) => api.post('/orders', data),
  
  // 获取订单列表
  getOrders: (params) => api.get('/orders', { params }),
  
  // 获取订单详情
  getOrder: (id) => api.get(`/orders/${id}`),
  
  // 更新订单状态
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  
  // 取消订单
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`),
  
  // 确认收货
  confirmReceipt: (id) => api.post(`/orders/${id}/confirm`),
  
  // 评价订单
  reviewOrder: (id, data) => api.post(`/orders/${id}/review`, data)
}

// 上传相关接口
export const uploadApi = {
  // 上传图片
  uploadImage: (data) => api.post('/upload/image', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // 删除图片
  deleteImage: (id) => api.delete(`/upload/image/${id}`)
}

export default api 