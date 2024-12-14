<template>
  <div class="product-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated :rows="10" />
    </div>
    
    <!-- Error Message -->
    <el-result
      v-else-if="error"
      icon="error"
      :title="error.message"
      :sub-title="error.description"
    >
      <template #extra>
        <el-button type="primary" @click="loadProduct">Retry</el-button>
      </template>
    </el-result>

    <!-- Product Status Alert -->
    <el-alert
      v-if="product.status !== 'active'"
      :title="getStatusText(product.status)"
      :type="getStatusType(product.status)"
      :description="getStatusDescription(product.status)"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />

    <div v-else class="container">
      <!-- Product Basic Info -->
      <div class="product-container">
        <div class="product-gallery">
          <el-carousel
            :interval="4000"
            type="card"
            height="400px"
            class="product-carousel"
            @click="handlePreview(activeImage)"
          >
            <el-carousel-item 
              v-for="(image, index) in product.images" 
              :key="index"
              @click="handlePreview(image)"
            >
              <div 
                class="carousel-image"
                :style="{ background: image.bgColor }"
              >
                <div v-if="!image.url" class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                  <span>No Image</span>
                </div>
                <el-image
                  v-else
                  :src="image.url"
                  fit="cover"
                  :preview-src-list="product.images.map(img => img.url)"
                  :initial-index="index"
                  class="carousel-image"
                  loading="lazy"
                />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1 class="product-title">{{ product.title }}</h1>
            <div class="product-meta">
              <span class="time">{{ formatTime(product.createTime) }}</span>
              <span class="views">{{ product.views }} views</span>
            </div>
          </div>

          <div class="product-price">
            <div class="current-price">
              <span class="label">Price</span>
              <span class="amount">${{ product.price }}</span>
              <!-- Price Trend Icon -->
              <el-tooltip
                v-if="priceHistory.length > 0"
                effect="dark"
                placement="top"
              >
                <template #content>
                  <div class="price-history">
                    <div class="history-title">Price History</div>
                    <div class="history-list">
                      <div v-for="(record, index) in priceHistory" :key="index" class="history-item">
                        <span class="date">{{ formatDate(record.date) }}</span>
                        <span class="price">${{ record.price }}</span>
                        <span class="change" :class="record.type">
                          {{ record.type === 'increase' ? '↑' : '↓' }}
                          {{ record.change }}%
                        </span>
                      </div>
                    </div>
                  </div>
                </template>
                <el-icon class="price-trend"><TrendCharts /></el-icon>
              </el-tooltip>
            </div>
            <div class="original-price" v-if="product.originalPrice">
              <span class="label">Original Price</span>
              <span class="amount">${{ product.originalPrice }}</span>
            </div>
          </div>

          <div class="product-attrs">
            <div class="attr-item">
              <span class="label">Condition</span>
              <span class="value">{{ product.condition }}</span>
            </div>
            <div class="attr-item">
              <span class="label">Category</span>
              <span class="value">{{ product.category }}</span>
            </div>
            <div class="attr-item">
              <span class="label">Location</span>
              <span class="value">{{ product.location }}</span>
            </div>
          </div>

          <div class="product-tags">
            <el-tag
              v-for="tag in product.tags"
              :key="tag"
              class="tag"
              :type="getTagType(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>

          <!-- Product Status Tag -->
          <div class="product-status">
            <el-tag
              :type="getStatusType(product.status)"
              effect="dark"
              size="large"
            >
              {{ getStatusText(product.status) }}
            </el-tag>
          </div>

          <div class="action-buttons">
            <el-button
              type="primary"
              size="large"
              :icon="ChatDotRound"
              @click="handleChat"
            >
              Contact Seller
            </el-button>
            <el-button
              :type="isFavorite ? 'danger' : 'default'"
              size="large"
              :icon="Star"
              @click="handleFavorite"
            >
              {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
            </el-button>
            <el-button
              type="danger"
              plain
              size="large"
              :icon="Warning"
              @click="handleReport"
            >
              Report
            </el-button>
            <!-- Share Button -->
            <el-dropdown @command="handleShare" trigger="click">
              <el-button size="large" :icon="Share">
                Share
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="wechat">
                    <el-icon><WechatFilled /></el-icon>WeChat
                  </el-dropdown-item>
                  <el-dropdown-item command="qq">
                    <el-icon><Platform /></el-icon>QQ
                  </el-dropdown-item>
                  <el-dropdown-item command="link">
                    <el-icon><Link /></el-icon>Copy Link
                  </el-dropdown-item>
                  <el-dropdown-item command="qrcode">
                    <el-icon><QrCode /></el-icon>QR Code
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- Product Details and Seller Info -->
      <div class="detail-container">
        <div class="detail-main">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="Product Details" name="detail">
              <div class="detail-content">
                <h3>Description</h3>
                <p class="description">{{ product.description }}</p>
                
                <h3>Product Images</h3>
                <div class="detail-images">
                  <div 
                    v-for="index in 3" 
                    :key="index"
                    class="detail-image"
                    :style="{ background: detailImageColors[index - 1] }"
                  ></div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="Trading Information" name="notice">
              <div class="notice-content">
                <h3>Trading Methods</h3>
                <ul class="trade-methods">
                  <li v-for="method in product.tradeMethods" :key="method">
                    <el-icon><Check /></el-icon>
                    <span>{{ method }}</span>
                  </li>
                </ul>

                <h3>Safety Tips</h3>
                <ul class="safety-tips">
                  <li>Recommend meeting in person for transactions, pay after confirming the item</li>
                  <li>Do not trust any form of transfer links</li>
                  <li>Do not use payment methods outside the platform</li>
                  <li>Report or contact customer service if you encounter suspicious situations</li>
                </ul>
              </div>
            </el-tab-pane>
            
            <!-- Questions Section -->
            <el-tab-pane label="Buyer Questions" name="questions">
              <div class="questions-section">
                <div class="questions-header">
                  <h3>Product Questions</h3>
                  <el-button 
                    type="primary" 
                    @click="handleAskQuestion"
                    :disabled="!isAuthenticated || product.status !== 'active'"
                  >
                    Ask a Question
                  </el-button>
                </div>

                <!-- Question Form -->
                <div v-if="showQuestionForm" class="question-form">
                  <el-form
                    ref="questionForm"
                    :model="questionForm"
                    :rules="questionRules"
                  >
                    <el-form-item prop="content">
                      <el-input
                        v-model="questionForm.content"
                        type="textarea"
                        :rows="3"
                        placeholder="Enter your question..."
                        :maxlength="500"
                        show-word-limit
                      />
                    </el-form-item>
                    <el-form-item>
                      <el-button 
                        type="primary"
                        :loading="submittingQuestion"
                        @click="submitQuestion"
                      >
                        Submit Question
                      </el-button>
                      <el-button @click="showQuestionForm = false">Cancel</el-button>
                    </el-form-item>
                  </el-form>
                </div>

                <!-- Question List -->
                <div class="questions-list">
                  <el-empty 
                    v-if="!questions.length"
                    description="No questions yet"
                  >
                    <template #extra>
                      <el-button 
                        type="primary"
                        @click="handleAskQuestion"
                        :disabled="!isAuthenticated || product.status !== 'active'"
                      >
                        Ask a Question
                      </el-button>
                    </template>
                  </el-empty>

                  <el-timeline v-else>
                    <el-timeline-item
                      v-for="question in questions"
                      :key="question.id"
                      :timestamp="formatTime(question.createTime)"
                      :type="question.answer ? 'success' : 'primary'"
                    >
                      <div class="question-item">
                        <div class="question-header">
                          <div class="user-info">
                            <el-avatar 
                              :src="question.user.avatar"
                              :size="32"
                            >
                              {{ question.user.username?.[0]?.toUpperCase() }}
                            </el-avatar>
                            <span class="username">{{ question.user.username }}</span>
                          </div>
                        </div>
                        <div class="question-content">{{ question.content }}</div>
                        
                        <div class="answer" v-if="question.answer">
                          <div class="answer-header">
                            <el-tag size="small" type="success">Seller Reply</el-tag>
                            <span class="time">{{ formatTime(question.answer.createTime) }}</span>
                          </div>
                          <div class="answer-content">{{ question.answer.content }}</div>
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>

                  <!-- Load More -->
                  <div class="load-more" v-if="hasMoreQuestions">
                    <el-button
                      :loading="loadingMoreQuestions"
                      @click="loadMoreQuestions"
                    >
                      Load More
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="detail-side">
          <!-- Seller Info -->
          <div class="seller-card">
            <div class="seller-header">
              <!-- TODO: 待添加卖家头像，当前使用纯色背景 -->
              <div class="seller-avatar" :style="{ background: '#f5f5f5' }">
                {{ product.seller.username?.[0]?.toUpperCase() }}
              </div>
              <div class="seller-info">
                <h3>{{ product.seller.username }}</h3>
                <p>{{ product.seller.school }}</p>
              </div>
            </div>

            <div class="seller-stats">
              <div class="stat-item">
                <span class="value">{{ product.seller.creditScore }}</span>
                <span class="label">Credit Score</span>
              </div>
              <div class="stat-item">
                <span class="value">{{ product.seller.dealCount }}</span>
                <span class="label">Deals</span>
              </div>
              <div class="stat-item">
                <span class="value">{{ product.seller.followCount }}</span>
                <span class="label">Followers</span>
              </div>
            </div>

            <!-- Seller Other Products -->
            <div class="seller-products">
              <h4>Seller Other Products</h4>
              <div class="product-list">
                <!-- TODO: 待添加商品图片，当前使用纯色背景 -->
                <div
                  v-for="item in sellerProducts"
                  :key="item.id"
                  class="product-item"
                  @click="handleProductClick(item.id)"
                >
                  <div 
                    class="product-image" 
                    :style="{ background: item.bgColor }"
                  >
                    <div class="image-placeholder">
                      <el-icon><Picture /></el-icon>
                    </div>
                  </div>
                  <div class="product-info">
                    <p class="title">{{ item.title }}</p>
                    <p class="price">${{ item.price }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Similar Products Recommendation -->
          <div class="similar-products">
            <h3>Similar Products</h3>
            <div class="product-list">
              <el-skeleton v-if="loadingSimilar" :count="3" />
              <template v-else>
                <div
                  v-for="item in similarProducts"
                  :key="item.id"
                  class="product-item"
                  @click="handleProductClick(item)"
                >
                  <el-image
                    :src="item.image"
                    fit="cover"
                    class="product-image"
                    loading="lazy"
                  >
                    <template #placeholder>
                      <div class="image-placeholder" :style="{ background: '#f5f5f5' }" />
                    </template>
                  </el-image>
                  <div class="product-info">
                    <h4>{{ item.title }}</h4>
                    <div class="price">${{ item.price }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Drawer -->
    <el-drawer
      v-model="chatVisible"
      title="Contact Seller"
      direction="rtl"
      size="300px"
    >
      <div class="chat-container">
        <div class="chat-messages" ref="messageContainer">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="{ 'message-self': msg.isSelf }"
          >
            <!-- TODO: 待添加用户头像，当前使用纯色背景 -->
            <div 
              class="message-avatar" 
              :style="{ background: '#f5f5f5' }"
            >
              {{ msg.isSelf ? userInfo.username?.[0]?.toUpperCase() : product.seller.username?.[0]?.toUpperCase() }}
            </div>
            <div class="message-content">
              <p class="message-text">{{ msg.content }}</p>
              <span class="message-time">{{ formatTime(msg.time) }}</span>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <el-input
            v-model="messageText"
            placeholder="Enter message..."
            :rows="3"
            type="textarea"
            @keyup.enter="handleSendMessage"
          />
          <el-button
            type="primary"
            :icon="Position"
            @click="handleSendMessage"
          >
            Send
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- Report Dialog -->
    <el-dialog
      v-model="reportVisible"
      title="Report Product"
      width="500px"
    >
      <el-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        label-width="80px"
      >
        <el-form-item label="Report Reason" prop="reason">
          <el-select v-model="reportForm.reason" placeholder="Select report reason">
            <el-option
              v-for="item in reportReasons"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Detailed Description" prop="description">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="Please provide a detailed description of the issue..."
          />
        </el-form-item>

        <el-form-item label="Image Proof" prop="images">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
          >
            <!-- TODO: 待添加图片预览，当前使用纯色背景 -->
            <div class="upload-placeholder" :style="{ background: '#f5f5f5' }">
              <el-icon><Plus /></el-icon>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reportVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleSubmitReport">Submit Report</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Add Share QR Code Dialog -->
    <el-dialog
      v-model="qrcodeVisible"
      title="Scan to Share"
      width="300px"
      align-center
    >
      <div class="qrcode-container">
        <!-- TODO: 待添加二维码图片，当前使用纯色背景 -->
        <div class="qrcode-image" :style="{ background: '#f5f5f5' }"></div>
        <p class="qrcode-tip">Use your phone to scan and share</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { 
  ChatDotRound,
  Star,
  Warning,
  Share,
  Check,
  Picture,
  Link,
  Platform,
  TrendCharts,
  Promotion as QrCode,
  ChatRound as WechatFilled,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const loading = ref(true)
const error = ref(null)
const activeTab = ref('detail')
const isFavorite = ref(false)
const showQuestionForm = ref(false)
const submittingQuestion = ref(false)
const loadingSimilar = ref(false)
const loadingMoreQuestions = ref(false)
const hasMoreQuestions = ref(true)
const questionPage = ref(1)
const sellerProducts = ref([])

// Form State
const questionForm = ref({
  content: ''
})

const questionRules = {
  content: [
    { required: true, message: 'Please enter question content', trigger: 'blur' },
    { min: 5, max: 500, message: 'Question content length should be between 5 and 500 characters', trigger: 'blur' }
  ]
}

const isAuthenticated = computed(() => userStore.isAuthenticated)

// Product Data
const product = ref({
  id: '',
  title: '',
  price: 0,
  originalPrice: 0,
  location: '',
  createTime: '',
  description: '',
  status: 'active',
  images: [],
  seller: {
    id: '',
    username: '',
    avatar: '',
    school: '',
    creditScore: 0,
    dealCount: 0,
    followCount: 0
  }
})

// Similar Product Data
const similarProducts = ref([])

// Question List Data
const questions = ref([])

// Chat Related State
const chatVisible = ref(false)
const messageText = ref('')
const messages = ref([])

// Report Related State
const reportVisible = ref(false)
const reportForm = ref({
  reason: '',
  description: '',
  images: []
})

// QR Code Related State
const qrcodeVisible = ref(false)

// Price History Data
const priceHistory = ref([])

// User Info
const userInfo = ref({
  username: ''
})

// Report Reason Options
const reportReasons = [
  { label: 'Product Violation', value: 'violation' },
  { label: 'Fake Price', value: 'fake_price' },
  { label: 'Wrong Description', value: 'wrong_description' },
  { label: 'Other Reason', value: 'other' }
]

// Report Form Validation Rules
const reportRules = {
  reason: [
    { required: true, message: 'Please select a report reason', trigger: 'change' }
  ],
  description: [
    { required: true, message: 'Please provide a detailed description', trigger: 'blur' },
    { min: 10, max: 500, message: 'Description length should be between 10 and 500 characters', trigger: 'blur' }
  ]
}

// Get Tag Type
const getTagType = (tag) => {
  const typeMap = {
    '95新': 'success',
    '保修中': 'primary',
    '议价': 'warning'
  }
  return typeMap[tag] || ''
}

// Handle Chat
const handleChat = () => {
  if (!isAuthenticated.value) {
    ElMessageBox.confirm(
      'Chat requires login, do you want to log in?',
      '提示',
      {
        confirmButtonText: 'Log In',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        })
      })
      .catch(() => {})
    return
  }
  chatVisible.value = true
}

// Handle Favorite
const handleFavorite = async () => {
  if (!isAuthenticated.value) {
    ElMessageBox.confirm(
      'Favorite requires login, do you want to log in?',
      '提示',
      {
        confirmButtonText: 'Log In',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        })
      })
      .catch(() => {})
    return
  }
  
  try {
    // TODO: Call API for favorite
    isFavorite.value = !isFavorite.value
    ElMessage.success(isFavorite.value ? 'Favorite added' : 'Removed from favorites')
  } catch (error) {
    ElMessage.error('Operation failed, please try again')
  }
}

// Handle Report
const handleReport = () => {
  if (!isAuthenticated.value) {
    ElMessageBox.confirm(
      'Report requires login, do you want to log in?',
      '提示',
      {
        confirmButtonText: 'Log In',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        })
      })
      .catch(() => {})
    return
  }
  reportVisible.value = true
}

// Handle Share
const handleShare = (type) => {
  switch (type) {
    case 'wechat':
      // TODO: Implement WeChat sharing
      ElMessage.success('WeChat sharing feature under development')
      break
    case 'qq':
      // TODO: Implement QQ sharing
      ElMessage.success('QQ sharing feature under development')
      break
    case 'link':
      // Copy link
      const url = window.location.href
      navigator.clipboard.writeText(url)
        .then(() => ElMessage.success('Link copied'))
        .catch(() => ElMessage.error('Copy failed'))
      break
    case 'qrcode':
      qrcodeVisible.value = true
      break
  }
}

// Handle Send Message
const handleSendMessage = () => {
  if (!messageText.value.trim()) {
    ElMessage.warning('Please enter message content')
    return
  }
  
  // TODO: Implement send message
  messages.value.push({
    id: Date.now(),
    content: messageText.value,
    time: new Date().toISOString(),
    isSelf: true
  })
  
  messageText.value = ''
  
  // Simulate automatic reply
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      content: 'Received your message, will reply shortly',
      time: new Date().toISOString(),
      isSelf: false
    })
  }, 1000)
}

// Handle Picture Upload
const handlePictureCardPreview = (file) => {
  // TODO: Implement picture preview
}

const handleRemove = (file) => {
  // TODO: Implement picture removal
}

const beforeUpload = (file) => {
  // TODO: Implement upload validation
  return false
}

// Handle Submit Report
const handleSubmitReport = () => {
  // TODO: Implement report submission
  ElMessage.success('Report submitted')
  reportVisible.value = false
}

// Get Product Status Text
const getStatusText = (status) => {
  const statusMap = {
    active: 'On Sale',
    sold: 'Sold',
    inactive: 'Inactive',
    reviewing: 'Reviewing',
    rejected: 'Rejected'
  }
  return statusMap[status] || status
}

// Get Product Status Type
const getStatusType = (status) => {
  const typeMap = {
    active: 'success',
    sold: 'info',
    inactive: 'warning',
    reviewing: 'primary',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

// Get Product Status Description
const getStatusDescription = (status) => {
  const descMap = {
    sold: 'This product has been sold, you can view the seller\'s other products',
    inactive: 'This product has been removed from sale, you can view similar products',
    reviewing: 'This product is under review, it will be available after review',
    rejected: 'This product failed review, temporarily unavailable'
  }
  return descMap[status] || ''
}

// Load Product Data
const loadProduct = async () => {
  loading.value = true
  try {
    const id = route.params.id
    // TODO: Call API to get product details
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate data
    product.value = {
      id: String(id),
      title: `Product${id}`,
      price: Math.floor(Math.random() * 1000) + 100,
      originalPrice: Math.floor(Math.random() * 2000) + 1000,
      location: 'Example University',
      createTime: new Date().toISOString(),
      description: 'This is an example product description, containing detailed product information...',
      status: 'active',
      images: [
        // Use soft pastel colors
        { url: '', bgColor: '#E3F2FD' },  // Light Blue
        { url: '', bgColor: '#F3E5F5' },  // Light Purple
        { url: '', bgColor: '#E8F5E9' },  // Light Green
        { url: '', bgColor: '#FFF3E0' }   // Light Orange
      ],
      seller: {
        id: 1,
        username: 'Example Seller',
        avatar: '',
        school: 'Example University',
        creditScore: 4.5,
        dealCount: 10,
        followCount: 20
      },
      tags: ['95新', '保修中'],
      tradeMethods: ['线下交易', '在线支付'],
      views: 100
    }

    // Simulate seller other products data
    sellerProducts.value = Array(4).fill(null).map((_, index) => ({
      id: String(Date.now() + index),
      title: `Product${index + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      // Use different pastel colors
      bgColor: [
        '#E3F2FD',  // Light Blue
        '#F3E5F5',  // Light Purple
        '#E8F5E9',  // Light Green
        '#FFF3E0'   // Light Orange
      ][index]
    }))

    // Load similar products
    loadSimilarProducts()
  } catch (error) {
    console.error('Failed to load product:', error)
    error.value = {
      message: 'Failed to load product',
      description: 'Please try again later'
    }
  } finally {
    loading.value = false
  }
}

// Load Similar Products
const loadSimilarProducts = async () => {
  loadingSimilar.value = true
  try {
    // Simulate similar product data
    similarProducts.value = Array(3).fill(null).map((_, index) => ({
      id: String(Date.now() + index),
      title: `Similar Product${index + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      // Use different pastel colors
      bgColor: [
        '#E3F2FD',  // Light Blue
        '#F3E5F5',  // Light Purple
        '#E8F5E9'   // Light Green
      ][index]
    }))
  } finally {
    loadingSimilar.value = false
  }
}

// Load Question List
const loadQuestions = async () => {
  try {
    // TODO: Call API to get question list
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (questionPage.value >= 3) {
      hasMoreQuestions.value = false
    }
  } catch (err) {
    ElMessage.error('Failed to load question list')
  }
}

// Load More Questions
const loadMoreQuestions = async () => {
  if (loadingMoreQuestions.value || !hasMoreQuestions.value) return
  
  loadingMoreQuestions.value = true
  try {
    questionPage.value++
    await loadQuestions()
  } finally {
    loadingMoreQuestions.value = false
  }
}

// Handle Ask Question
const handleAskQuestion = () => {
  if (!isAuthenticated.value) {
    ElMessageBox.confirm(
      'Question requires login, do you want to log in?',
      '提示',
      {
        confirmButtonText: 'Log In',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )
      .then(() => {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        })
      })
      .catch(() => {})
    return
  }
  
  showQuestionForm.value = true
}

// Submit Question
const submitQuestion = async () => {
  if (!questionForm.value.content.trim()) {
    ElMessage.warning('Please enter question content')
    return
  }

  submittingQuestion.value = true
  try {
    // TODO: Call API to submit question
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showQuestionForm.value = false
    questionForm.value.content = ''
    ElMessage.success('Question submitted')
    
    // Reload question list
    questionPage.value = 1
    await loadQuestions()
  } catch (err) {
    ElMessage.error('Submission failed')
  } finally {
    submittingQuestion.value = false
  }
}

// Handle Image Preview
const handlePreview = (image) => {
  // Use el-image component's preview feature, no additional processing needed
}

// Handle Product Click
const handleProductClick = (product) => {
  router.push(`/product/${product.id}`)
}

// Lifecycle
onMounted(() => {
  loadProduct()
})

// Format Time
const formatTime = (time) => {
  if (!time) return ''
  try {
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: zhCN
    })
  } catch (error) {
    console.error('Invalid time:', time)
    return ''
  }
}

// Format Date
const formatDate = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'yyyy-MM-dd', {
      locale: zhCN
    })
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}

// Product Detail Image Background Colors
const detailImageColors = [
  '#E3F2FD',  // Light Blue
  '#F3E5F5',  // Light Purple
  '#E8F5E9',  // Light Green
  '#FFF3E0'   // Light Orange
]
</script>

<style lang="scss" scoped>
.product-detail {
  padding: 40px 0;
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.product-gallery {
  .product-carousel {
    :deep(.el-carousel__item) {
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
  }
}

.product-info {
  .product-header {
    margin-bottom: 24px;

    .product-title {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .product-meta {
      color: var(--text-secondary);
      font-size: 14px;

      .time {
        margin-right: 16px;
      }
    }
  }

  .product-price {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: var(--radius-md);
    margin-bottom: 24px;

    .current-price {
      margin-bottom: 8px;

      .label {
        color: var(--text-secondary);
        margin-right: 8px;
      }

      .amount {
        font-size: 28px;
        font-weight: bold;
        color: var(--danger-color);
      }
    }

    .original-price {
      .label {
        color: var(--text-secondary);
        margin-right: 8px;
      }

      .amount {
        color: var(--text-secondary);
        text-decoration: line-through;
      }
    }
  }

  .product-attrs {
    margin-bottom: 24px;

    .attr-item {
      display: flex;
      margin-bottom: 12px;

      .label {
        width: 80px;
        color: var(--text-secondary);
      }

      .value {
        flex: 1;
      }
    }
  }

  .product-tags {
    margin-bottom: 24px;

    .tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 16px;
  }
}

.detail-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.detail-main {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;

  .detail-content {
    h3 {
      font-size: 18px;
      margin-bottom: 16px;
    }

    .description {
      color: var(--text-secondary);
      line-height: 1.8;
      margin-bottom: 24px;
    }

    .detail-images {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      .el-image {
        border-radius: var(--radius-md);
        overflow: hidden;
      }
    }
  }
}

.notice-content {
  h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .trade-methods,
  .safety-tips {
    list-style: none;
    margin-bottom: 24px;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      color: var(--text-secondary);

      .el-icon {
        color: var(--success-color);
      }
    }
  }
}

.seller-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;

  .seller-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;

    .seller-info {
      h3 {
        font-size: 18px;
        margin-bottom: 4px;
      }

      p {
        color: var(--text-secondary);
      }
    }
  }

  .seller-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
    margin-bottom: 24px;

    .stat-item {
      .value {
        display: block;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
      }

      .label {
        color: var(--text-secondary);
        font-size: 14px;
      }
    }
  }

  .seller-products {
    h4 {
      font-size: 16px;
      margin-bottom: 16px;
    }
  }
}

.similar-products {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;

  h3 {
    font-size: 18px;
    margin-bottom: 16px;
  }
}

.product-list {
  display: grid;
  gap: 16px;

  .product-item {
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      transform: translateY(-2px);
    }

    .el-image {
      width: 100%;
      height: 120px;
      border-radius: var(--radius-md);
      margin-bottom: 8px;
    }

    .product-info {
      .title {
        font-size: 14px;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .price {
        color: var(--danger-color);
        font-weight: bold;
      }
    }
  }
}

.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;

    .message {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      &.message-self {
        flex-direction: row-reverse;

        .message-content {
          align-items: flex-end;

          .message-text {
            background: var(--primary-color);
            color: white;
          }
        }
      }

      .message-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .message-text {
          background: var(--bg-secondary);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          max-width: 80%;
        }

        .message-time {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .chat-input {
    padding: 20px;
    border-top: 1px solid var(--border-color);
    display: flex;
    gap: 12px;

    .el-input {
      flex: 1;
    }
  }
}

@media (max-width: 1024px) {
  .product-container {
    grid-template-columns: 1fr;
  }

  .detail-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: 20px 0;
  }

  .product-gallery {
    margin: -20px;
    margin-bottom: 20px;

    .product-carousel {
      border-radius: 0;
    }
  }

  .action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 20px;
    background: white;
    box-shadow: var(--shadow-lg);
    z-index: 100;
  }
}

.carousel-item {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg);
}

.detail-image {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
}

.seller-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-secondary);
  margin-right: 16px;
}

.product-image {
  width: 100%;
  padding-top: 100%;
  border-radius: var(--radius-sm);
  background-size: cover;
  background-position: center;
  margin-bottom: 8px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-secondary);
  margin-right: 8px;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: #e0e0e0 !important;
  }
}

.price-trend {
  margin-left: 8px;
  color: var(--primary-color);
  cursor: pointer;
}

.price-history {
  padding: 8px;
  
  .history-title {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
    
    .date {
      color: var(--text-secondary);
      font-size: 12px;
    }
    
    .price {
      font-weight: 500;
    }
    
    .change {
      font-size: 12px;
      
      &.increase {
        color: var(--danger-color);
      }
      
      &.decrease {
        color: var(--success-color);
      }
    }
  }
}

.questions-section {
  .questions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
    }
  }
}

.question-item {
  background: white;
  padding: 16px;
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
  
  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .user-info {
      display: flex;
      align-items: center;
      
      .username {
        margin-left: 8px;
        font-weight: 500;
      }
    }
    
    .time {
      color: var(--text-secondary);
      font-size: 12px;
    }
  }
  
  .question-content {
    margin-bottom: 16px;
    line-height: 1.5;
  }
  
  .answer {
    background: var(--bg-secondary);
    padding: 12px;
    border-radius: var(--radius-sm);
    
    .answer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .time {
        color: var(--text-secondary);
        font-size: 12px;
      }
    }
    
    .answer-content {
      color: var(--text-primary);
      line-height: 1.5;
    }
  }
}

.qrcode-container {
  text-align: center;
  
  .qrcode-image {
    width: 200px;
    height: 200px;
    margin: 0 auto 16px;
    border-radius: var(--radius-sm);
  }
  
  .qrcode-tip {
    color: var(--text-secondary);
    margin: 0;
  }
}

.loading-container {
  padding: 40px;
}

.product-status {
  margin: 20px 0;
  text-align: center;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  
  .el-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }
}

.question-form {
  margin: 20px 0;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.questions-list {
  margin-top: 20px;
}

.similar-products {
  margin-top: 40px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);

  h3 {
    margin-bottom: 16px;
    font-size: 18px;
    color: var(--text-primary);
  }

  .product-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .product-item {
    display: flex;
    gap: 12px;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      transform: translateY(-2px);
    }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .product-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      h4 {
        margin: 0;
        font-size: 14px;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .price {
        color: var(--primary-color);
        font-weight: 500;
      }
    }
  }
}

// Mobile Responsive
@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }

  .product-gallery,
  .product-info {
    width: 100%;
  }

  .detail-container {
    flex-direction: column;
  }

  .detail-main,
  .detail-side {
    width: 100%;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 8px;

    .el-button {
      flex: 1;
      min-width: 120px;
    }
  }
}
</style> 