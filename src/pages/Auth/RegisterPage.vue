<template>
  <div class="register-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h2>Create Account</h2>
          <p>Join the campus marketplace and start your trading journey</p>
        </div>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          class="auth-form"
          @submit.prevent="handleSubmit"
        >
          <!-- Username -->
          <el-form-item prop="username">
            <el-input
              v-model="formData.username"
              placeholder="Username"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <!-- Phone -->
          <el-form-item prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="Phone number"
              :prefix-icon="Phone"
              size="large"
            >
              <template #append>
                <el-button
                  :disabled="!!countdown || !formData.phone"
                  @click="handleSendCode"
                >
                  {{ countdown ? `${countdown}s` : 'Get Code' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <!-- Verification Code -->
          <el-form-item prop="code">
            <el-input
              v-model="formData.code"
              placeholder="Verification code"
              :prefix-icon="Key"
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

          <!-- Confirm Password -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Confirm password"
              :prefix-icon="Lock"
              size="large"
              show-password
            />
          </el-form-item>

          <!-- School Selection -->
          <el-form-item prop="school">
            <el-select
              v-model="formData.school"
              placeholder="Select school"
              size="large"
              class="school-select"
              filterable
            >
              <el-option
                v-for="school in schools"
                :key="school.value"
                :label="school.label"
                :value="school.value"
              />
            </el-select>
          </el-form-item>

          <!-- User Agreement -->
          <el-form-item prop="agreement">
            <el-checkbox v-model="formData.agreement">
              I have read and agree to the
              <el-link type="primary" :underline="false" @click="showAgreement">
                Terms of Service
              </el-link>
              and
              <el-link type="primary" :underline="false" @click="showPrivacy">
                Privacy Policy
              </el-link>
            </el-checkbox>
          </el-form-item>

          <!-- Register Button -->
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            native-type="submit"
          >
            Sign Up
          </el-button>

          <!-- Login Link -->
          <div class="auth-footer">
            <span>Already have an account?</span>
            <router-link to="/login" class="login-link">
              Sign in now
            </router-link>
          </div>
        </el-form>
      </div>

      <!-- Banner Area -->
      <div class="auth-banner">
        <div class="banner-content">
          <h2>Join Campus Marketplace</h2>
          <p>Find the best secondhand items with the safest trading environment</p>
          <ul class="feature-list">
            <li>
              <el-icon><User /></el-icon>
              <span>Real-name verification for security</span>
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

    <!-- Terms of Service Dialog -->
    <el-dialog
      v-model="agreementVisible"
      title="Terms of Service"
      width="600px"
      class="agreement-dialog"
    >
      <div class="agreement-content">
        <h3>Welcome to Campus Marketplace</h3>
        <p>This agreement is a legal contract between you and Campus Marketplace...</p>
        <!-- Add more terms content here -->
      </div>
    </el-dialog>

    <!-- Privacy Policy Dialog -->
    <el-dialog
      v-model="privacyVisible"
      title="Privacy Policy"
      width="600px"
      class="privacy-dialog"
    >
      <div class="privacy-content">
        <h3>Privacy Policy</h3>
        <p>We take your personal information protection very seriously...</p>
        <!-- Add more privacy policy content here -->
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Phone,
  Key,
  Wallet,
  ChatLineRound,
  Check
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const countdown = ref(0)
const agreementVisible = ref(false)
const privacyVisible = ref(false)

// Form data
const formData = reactive({
  username: '',
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
  school: '',
  agreement: false
})

// School list
const schools = [
  { value: 'pku', label: 'Peking University' },
  { value: 'thu', label: 'Tsinghua University' },
  { value: 'fudan', label: 'Fudan University' },
  { value: 'sjtu', label: 'Shanghai Jiao Tong University' },
  { value: 'zju', label: 'Zhejiang University' },
  // More schools...
]

// Form validation rules
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter your password'))
  } else {
    if (formData.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please confirm your password'))
  } else if (value !== formData.password) {
    callback(new Error('Passwords do not match'))
  } else {
    callback()
  }
}

const validatePhone = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please enter your phone number'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('Please enter a valid phone number'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: 'Please enter your username', trigger: 'blur' },
    { min: 3, message: 'Username must be at least 3 characters', trigger: 'blur' }
  ],
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: 'Please enter verification code', trigger: 'blur' },
    { len: 6, message: 'Verification code must be 6 digits', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  school: [
    { required: true, message: 'Please select your school', trigger: 'change' }
  ],
  agreement: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('Please agree to the Terms of Service and Privacy Policy'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// Send verification code
const handleSendCode = async () => {
  try {
    await formRef.value?.validateField('phone')
    loading.value = true
    
    // TODO: Call API to send verification code
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('Verification code sent successfully')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to send code:', error)
    ElMessage.error(error.message || 'Failed to send verification code')
  } finally {
    loading.value = false
  }
}

// Submit form
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await userStore.register({
      username: formData.username,
      phone: formData.phone,
      code: formData.code,
      password: formData.password,
      school: formData.school
    })
    
    ElMessage.success('Registration successful')
    router.push('/login')
  } catch (error) {
    console.error('Failed to register:', error)
    ElMessage.error(error.message || 'Registration failed, please try again')
  } finally {
    loading.value = false
  }
}

// Show agreement dialog
const showAgreement = () => {
  agreementVisible.value = true
}

// Show privacy dialog
const showPrivacy = () => {
  privacyVisible.value = true
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(120deg, #ffd1ff 0%, #fae8ff 50%, #e8f7ff 100%);
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

  :deep(.el-select) {
    .el-input__wrapper {
      &:hover {
        .el-input__inner {
          color: var(--primary-color);
        }
      }
    }

    .el-select__tags {
      background: transparent;
      padding: 2px;
    }
  }

  :deep(.el-checkbox) {
    .el-checkbox__inner {
      border-radius: 6px;
      border: 2px solid rgba(238, 242, 247, 0.8);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        border-color: rgba(var(--primary-color-rgb), 0.5);
      }
    }

    &.is-checked {
      .el-checkbox__inner {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        border-color: transparent;
        box-shadow: 0 2px 6px rgba(79, 172, 254, 0.2);
      }
    }
  }
}

.submit-btn {
  width: 100%;
  height: 52px;
  margin: 32px 0;
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

.auth-footer {
  text-align: center;
  color: var(--text-secondary);
  font-size: 15px;

  .login-link {
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

      .el-icon {
        color: #fff;
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

.agreement-dialog,
.privacy-dialog {
  :deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.1),
      0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }

  :deep(.el-dialog__header) {
    background: linear-gradient(to right, rgba(79, 172, 254, 0.05), rgba(0, 242, 254, 0.05));
    border-bottom: 1px solid rgba(238, 242, 247, 0.8);
  }

  :deep(.el-dialog__title) {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }
}

@media (max-width: 1024px) {
  .auth-container {
    max-width: 900px;
  }
}

@media (max-width: 768px) {
  .register-page {
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
    margin: 24px 0;
  }
}
</style> 