<template>
  <div class="login-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to start your campus trading journey</p>
        </div>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          class="auth-form"
          @submit.prevent="handleSubmit"
        >
          <!-- Username/Phone/Email -->
          <el-form-item prop="account">
            <el-input
              v-model="formData.account"
              placeholder="Username/Phone/Email"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <!-- Password -->
          <el-form-item prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="Password"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <!-- Remember me and Forgot password -->
          <div class="form-options">
            <el-checkbox v-model="formData.remember">Remember me</el-checkbox>
            <el-link type="primary" :underline="false" @click="handleForgotPassword">
              Forgot password?
            </el-link>
          </div>

          <!-- Login button -->
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            native-type="submit"
          >
            Sign In
          </el-button>

          <!-- Other login methods -->
          <div class="divider">
            <span>Or continue with</span>
          </div>

          <div class="social-login">
            <el-button
              v-for="item in socialLogins"
              :key="item.type"
              :icon="item.icon"
              circle
              class="social-btn"
              @click="handleSocialLogin(item.type)"
            />
          </div>

          <!-- Register link -->
          <div class="auth-footer">
            <span>Don't have an account?</span>
            <router-link to="/register" class="register-link">
              Sign up now
            </router-link>
          </div>
        </el-form>
      </div>

      <!-- Banner area -->
      <div class="auth-banner">
        <div class="banner-content">
          <h2>Campus Marketplace</h2>
          <p>Give your unused items a new life, make campus life better</p>
          <ul class="feature-list">
            <li>
              <el-icon><Check /></el-icon>
              <span>Safe and reliable trading environment</span>
            </li>
            <li>
              <el-icon><Wallet /></el-icon>
              <span>Guaranteed transactions, worry-free payments</span>
            </li>
            <li>
              <el-icon><ChatLineRound /></el-icon>
              <span>Instant messaging for easy communication</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const {
  User,
  Lock,
  Check,
  Wallet,
  ChatLineRound,
  Platform,
  ChatDotRound,
  Service
} = ElementPlusIconsVue

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

// Form data
const formData = reactive({
  account: '',
  password: '',
  remember: false
})

// Form validation rules
const rules = {
  account: [
    { required: true, message: 'Please enter your username/phone/email', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    { min: 6, message: 'Password should be at least 6 characters', trigger: 'blur' }
  ]
}

// Social login options
const socialLogins = [
  { type: 'wechat', icon: Platform, title: '微信登录' },
  { type: 'qq', icon: Service, title: 'QQ登录' },
  { type: 'message', icon: ChatDotRound, title: '消息中心' }
]

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    await userStore.login({
      username: formData.account,
      password: formData.password
    })

    ElMessage.success('Successfully signed in')

    // Redirect to the original page if exists
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.message || 'Failed to sign in, please try again')
  } finally {
    loading.value = false
  }
}

// Social login
const handleSocialLogin = async (type) => {
  if (type === 'message') {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/message')
    } else {
      ElMessage.warning('请先登录后再访问消息中心')
    }
    return
  }

  ElMessage.info(`${socialLogins.find(item => item.type === type)?.title || type} 功能即将上线...`)
}

// Forgot password
const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    top: -50%;
    left: -50%;
    background: 
      radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 30%),
      radial-gradient(circle at 70% 50%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 30%);
    animation: rotate 30s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.auth-container {
  width: 100%;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.auth-card {
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 0% 0%, rgba(var(--primary-color-rgb), 0.03) 0%, rgba(var(--primary-color-rgb), 0) 50%),
      radial-gradient(circle at 100% 100%, rgba(var(--primary-color-rgb), 0.03) 0%, rgba(var(--primary-color-rgb), 0) 50%);
    pointer-events: none;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 36px;

  h2 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    color: #6366f1;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 16px;
    color: #64748b;
    line-height: 1.5;
  }
}

.auth-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;

  :deep(.el-input__wrapper) {
    box-shadow: none;
    border: 2px solid rgba(238, 242, 247, 0.8);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);

    &:hover {
      border-color: rgba(var(--primary-color-rgb), 0.5);
      background: rgba(255, 255, 255, 0.95);
    }

    &.is-focus {
      border-color: var(--primary-color);
      background: #fff;
      box-shadow: 
        0 0 0 4px rgba(var(--primary-color-rgb), 0.1),
        0 4px 12px rgba(var(--primary-color-rgb), 0.05);
    }
  }

  :deep(.el-input__inner) {
    height: 52px;
    padding: 0 20px;
  }

  :deep(.el-input__prefix) {
    left: 16px;
    font-size: 18px;
    color: var(--text-secondary);
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 32px;

  :deep(.el-checkbox__label) {
    color: var(--text-secondary);
  }

  :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
    color: var(--primary-color);
  }
}

.submit-btn {
  width: 100%;
  height: 52px;
  margin: 8px 0 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
    transform: translateY(-100%);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.25);

    &::before {
      transform: translateY(0);
    }
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: calc(50% - 70px);
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-color) 50%, var(--border-color));
  }

  &::after {
    right: 0;
    background: linear-gradient(90deg, var(--border-color), var(--border-color) 50%, transparent);
  }

  span {
    background: transparent;
    padding: 0 20px;
    color: var(--text-secondary);
    font-size: 14px;
    position: relative;
    z-index: 1;
  }
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;

  .social-btn {
    width: 48px;
    height: 48px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #64748b;
    transition: all 0.3s ease;

    &:hover {
      border-color: #6366f1;
      color: #6366f1;
      transform: translateY(-2px);
    }
  }
}

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;

  .register-link {
    color: var(--primary-color);
    font-weight: 600;
    margin-left: 8px;
    text-decoration: none;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--primary-color);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &:hover::after {
      transform: scaleX(1);
    }
  }
}

.auth-banner {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;

  .banner-content {
    color: #fff;
    position: relative;
    z-index: 1;

    h2 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    p {
      font-size: 17px;
      margin-bottom: 40px;
      line-height: 1.5;
      opacity: 0.9;
    }
  }

  .feature-list {
    li {
      background: rgba(255, 255, 255, 0.1);
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;

      .el-icon {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
        padding: 8px;
        border-radius: 50%;
      }
    }
  }
}

@media (max-width: 1024px) {
  .auth-container {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .login-page {
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .auth-container {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 20px;
  }

  .auth-banner {
    display: none;
  }

  .auth-card {
    padding: 40px 24px;
  }

  .auth-header {
    margin-bottom: 40px;

    h2 {
      font-size: 32px;
    }
  }

  .auth-form {
    :deep(.el-input__inner) {
      height: 48px;
    }
  }

  .submit-btn {
    height: 48px;
  }

  .social-login .social-btn {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
}
</style> 