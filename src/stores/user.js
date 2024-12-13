import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)

  // 方法
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const login = async (credentials) => {
    try {
      // 模拟登录请求
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock_token_123',
            user: {
              id: 1,
              username: credentials.username,
              avatar: '',
              email: 'user@example.com',
              phone: '13800138000',
              school: '示例大学',
              createTime: new Date().toISOString()
            }
          })
        }, 1000)
      })

      setToken(response.token)
      setUser(response.user)
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      // 模拟注册请求
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: 'mock_token_123',
            user: {
              id: 1,
              username: userData.username,
              avatar: '',
              email: userData.email,
              phone: userData.phone,
              school: userData.school,
              createTime: new Date().toISOString()
            }
          })
        }, 1000)
      })

      setToken(response.token)
      setUser(response.user)
      return response
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    }
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateProfile = async (userData) => {
    try {
      // 模拟更新请求
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...user.value,
            ...userData
          })
        }, 1000)
      })

      setUser(response)
      return response
    } catch (error) {
      console.error('Update profile failed:', error)
      throw error
    }
  }

  const updateAvatar = async (avatarUrl) => {
    try {
      // 模拟更新头像请求
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...user.value,
            avatar: avatarUrl
          })
        }, 1000)
      })

      setUser(response)
      return response
    } catch (error) {
      console.error('Update avatar failed:', error)
      throw error
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar
  }
}) 