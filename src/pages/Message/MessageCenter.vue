<template>
  <div class="message-center">
    <div class="container">
      <div class="message-container">
        <!-- Contact List -->
        <div class="contact-list">
          <div class="list-header">
            <h2>Messages</h2>
            <el-input
              v-model="searchText"
              placeholder="Search contacts..."
              prefix-icon="Search"
              clearable
            />
          </div>

          <div class="contact-items">
            <div
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-item"
              :class="{ active: currentContact?.id === contact.id }"
              @click="handleSelectContact(contact)"
            >
              <div class="contact-avatar">
                <el-badge
                  :value="contact.unreadCount"
                  :hidden="!contact.unreadCount"
                >
                  <div class="avatar" :style="{ background: '#f5f5f5' }">
                    {{ contact.username?.[0]?.toUpperCase() }}
                  </div>
                </el-badge>
              </div>
              <div class="contact-info">
                <div class="contact-header">
                  <h3>{{ contact.username }}</h3>
                  <span class="time">{{ formatTime(contact.lastMessage.time) }}</span>
                </div>
                <div class="contact-preview">
                  <p>{{ contact.lastMessage.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Window -->
        <div class="chat-window" v-if="currentContact">
          <div class="chat-header">
            <div class="user-info">
              <h2>{{ currentContact.username }}</h2>
              <p>{{ currentContact.online ? 'Online' : 'Offline' }}</p>
            </div>
            <div class="header-actions">
              <el-button
                type="primary"
                link
                @click="handleViewProduct"
                v-if="currentContact.productId"
              >
                View Product
              </el-button>
            </div>
          </div>

          <div class="chat-messages" ref="messageContainer">
            <div
              v-for="message in currentMessages"
              :key="message.id"
              class="message-item"
              :class="{ 'message-self': message.isSelf }"
            >
              <div class="message-avatar">
                <div 
                  class="avatar small"
                  :style="{ background: '#f5f5f5' }"
                >
                  {{ (message.isSelf ? username : currentContact.username)?.[0]?.toUpperCase() }}
                </div>
              </div>
              <div class="message-content">
                <div class="message-bubble">
                  <!-- Product Card Message -->
                  <div
                    v-if="message.type === 'product'"
                    class="product-message"
                    @click="handleViewProduct(message.product.id)"
                  >
                    <div 
                      class="product-cover"
                      :style="{ background: '#f5f5f5' }"
                    ></div>
                    <div class="product-info">
                      <h4>{{ message.product.title }}</h4>
                      <p class="price">${{ message.product.price }}</p>
                    </div>
                  </div>
                  <!-- Image Message -->
                  <div v-else-if="message.type === 'image'" class="image-message">
                    <div 
                      class="image-preview"
                      :style="{ background: '#f5f5f5' }"
                      @click="handlePreviewImage(message.content)"
                    ></div>
                  </div>
                  <!-- Text Message -->
                  <p v-else>{{ message.content }}</p>
                </div>
                <span class="message-time">{{ formatTime(message.time) }}</span>
              </div>
            </div>

            <div v-if="loading" class="loading-messages">
              <el-icon class="is-loading"><Loading /></el-icon>
              Loading more messages...
            </div>
          </div>

          <div class="chat-input">
            <div class="input-toolbar">
              <el-upload
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleImageSuccess"
                :before-upload="beforeImageUpload"
              >
                <el-button :icon="Picture" />
              </el-upload>
              <el-button
                :icon="Goods"
                @click="handleShareProduct"
              />
            </div>
            <div class="input-area">
              <el-input
                v-model="messageText"
                type="textarea"
                :rows="3"
                placeholder="Type a message..."
                resize="none"
                @keyup.enter.prevent="handleSendMessage"
              />
              <el-button
                type="primary"
                :icon="Position"
                @click="handleSendMessage"
                :loading="sending"
              >
                Send
              </el-button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" v-else>
          <el-empty description="Select a contact to start chatting">
            <el-button type="primary" @click="router.push('/')">
              Browse Products
            </el-button>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- Select Product Dialog -->
    <el-dialog
      v-model="productDialogVisible"
      title="Select Product to Share"
      width="600px"
    >
      <div class="product-list">
        <div
          v-for="product in userProducts"
          :key="product.id"
          class="product-item"
          @click="handleSelectProduct(product)"
        >
          <div 
            class="product-cover"
            :style="{ background: '#f5f5f5' }"
          ></div>
          <div class="product-info">
            <h4>{{ product.title }}</h4>
            <p class="price">${{ product.price }}</p>
            <p class="status">{{ getStatusText(product.status) }}</p>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Image Preview -->
    <el-dialog v-model="previewVisible">
      <div 
        class="preview-image"
        :style="{ 
          background: '#f5f5f5',
          width: '100%',
          height: '400px',
          borderRadius: 'var(--radius-lg)'
        }"
      ></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import {
  Picture,
  Goods,
  Position,
  Loading,
  Search
} from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const router = useRouter()
const userStore = useUserStore()
const messageContainer = ref(null)
const searchText = ref('')
const messageText = ref('')
const loading = ref(false)
const sending = ref(false)
const productDialogVisible = ref(false)
const previewVisible = ref(false)
const currentContact = ref(null)

// User info
const username = computed(() => userStore.user?.username)
const userAvatar = computed(() => userStore.user?.avatar)

// Mock contact data
const contacts = ref([
  {
    id: 1,
    username: 'John Doe',
    avatar: '',
    online: true,
    unreadCount: 2,
    productId: 1,
    lastMessage: {
      content: 'Is this item still available?',
      time: new Date(Date.now() - 1000 * 60 * 30)
    }
  },
  {
    id: 2,
    username: 'Jane Smith',
    avatar: '',
    online: false,
    unreadCount: 0,
    productId: 2,
    lastMessage: {
      content: 'Can we meet tomorrow?',
      time: new Date(Date.now() - 1000 * 60 * 60)
    }
  }
])

// Mock messages data
const messages = ref([
  {
    id: 1,
    content: 'Hi, is this item still available?',
    time: new Date(Date.now() - 1000 * 60 * 60),
    type: 'text',
    isSelf: false
  },
  {
    id: 2,
    content: 'Yes, it is still available.',
    time: new Date(Date.now() - 1000 * 60 * 30),
    type: 'text',
    isSelf: true
  },
  {
    id: 3,
    type: 'product',
    product: {
      id: 1,
      title: 'iPhone 12',
      price: 599,
      cover: ''
    },
    time: new Date(Date.now() - 1000 * 60 * 20),
    isSelf: true
  }
])

// Mock user products
const userProducts = ref([
  {
    id: 1,
    title: 'iPhone 12',
    price: 599,
    status: 'active',
    cover: ''
  },
  {
    id: 2,
    title: 'MacBook Pro',
    price: 1299,
    status: 'sold',
    cover: ''
  }
])

// Computed properties
const filteredContacts = computed(() => {
  if (!searchText.value) return contacts.value
  const search = searchText.value.toLowerCase()
  return contacts.value.filter(contact => 
    contact.username.toLowerCase().includes(search)
  )
})

const currentMessages = computed(() => {
  if (!currentContact.value) return []
  // TODO: Filter messages by contact
  return messages.value
})

// Methods
const handleSelectContact = (contact) => {
  currentContact.value = contact
  nextTick(() => {
    scrollToBottom()
  })
}

const handleSendMessage = async () => {
  if (!messageText.value.trim()) return
  
  try {
    sending.value = true
    // TODO: Call API to send message
    await new Promise(resolve => setTimeout(resolve, 500))
    
    messages.value.push({
      id: Date.now(),
      content: messageText.value,
      time: new Date(),
      type: 'text',
      isSelf: true
    })
    
    messageText.value = ''
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    ElMessage.error('Failed to send message, please try again')
  } finally {
    sending.value = false
  }
}

const handleImageSuccess = (response) => {
  messages.value.push({
    id: Date.now(),
    content: response.url,
    time: new Date(),
    type: 'image',
    isSelf: true
  })
  nextTick(() => {
    scrollToBottom()
  })
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Only image files are allowed')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('Image size cannot exceed 2MB')
    return false
  }
  return true
}

const handleShareProduct = () => {
  productDialogVisible.value = true
}

const handleSelectProduct = (product) => {
  messages.value.push({
    id: Date.now(),
    type: 'product',
    product,
    time: new Date(),
    isSelf: true
  })
  productDialogVisible.value = false
  nextTick(() => {
    scrollToBottom()
  })
}

const handleViewProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const handlePreviewImage = (url) => {
  previewVisible.value = true
}

const scrollToBottom = () => {
  const container = messageContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

const formatTime = (time) => {
  if (!time) return ''
  try {
    return formatDistanceToNow(new Date(time), {
      addSuffix: true,
      locale: enUS
    })
  } catch (error) {
    console.error('Invalid time:', time)
    return ''
  }
}

const getStatusText = (status) => {
  const statusMap = {
    active: 'Active',
    sold: 'Sold',
    removed: 'Removed'
  }
  return statusMap[status] || status
}

// Lifecycle hooks
onMounted(() => {
  scrollToBottom()
})

watch(currentContact, () => {
  // TODO: Load messages when contact changes
})
</script>

<style lang="scss" scoped>
.message-center {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.message-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  min-height: 600px;
  background: var(--bg-white);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.contact-list {
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
  }
}

.contact-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.contact-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  &.active {
    background: var(--primary-light);
  }
}

.contact-avatar {
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);

    &.small {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }
  }
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;

  h3 {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .time {
    font-size: 12px;
    color: var(--text-secondary);
  }
}

.contact-preview {
  p {
    font-size: 14px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .user-info {
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    p {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 70%;

  &.message-self {
    flex-direction: row-reverse;
    align-self: flex-end;

    .message-bubble {
      background: var(--primary-light);
      color: var(--primary-color);

      &::before {
        right: -8px;
        left: auto;
        border-left-color: var(--primary-light);
        border-right-color: transparent;
      }
    }
  }
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-bubble {
  background: var(--bg-secondary);
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
  margin-bottom: 4px;

  p {
    margin: 0;
    line-height: 1.4;
  }
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.product-message {
  display: flex;
  gap: 12px;
  background: var(--bg-white);
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  .product-cover {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }

  .product-info {
    flex: 1;
    min-width: 0;

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .price {
      font-size: 16px;
      font-weight: 600;
      color: var(--price-color);
    }
  }
}

.image-message {
  .image-preview {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }
}

.chat-input {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input-area {
  display: flex;
  gap: 12px;

  .el-input {
    flex: 1;
  }

  .el-button {
    align-self: flex-end;
  }
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 12px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
}

.product-item {
  background: var(--bg-white);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .product-cover {
    aspect-ratio: 1;
  }

  .product-info {
    padding: 12px;

    h4 {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .price {
      font-size: 16px;
      font-weight: 600;
      color: var(--price-color);
      margin-bottom: 4px;
    }

    .status {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

@media (max-width: 768px) {
  .message-center {
    padding: 0;
  }

  .message-container {
    grid-template-columns: 1fr;
    height: 100vh;
    border-radius: 0;
  }

  .contact-list {
    display: none;

    &.active {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 100;
      background: var(--bg-white);
    }
  }

  .chat-window {
    border-radius: 0;
  }

  .message-item {
    max-width: 85%;
  }
}
</style> 