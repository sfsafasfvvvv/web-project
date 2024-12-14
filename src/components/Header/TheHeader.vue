<template>
  <header class="header">
    <div class="container">
      <nav class="nav">
        <!-- Logo -->
        <router-link to="/" class="logo">
          <el-icon><Shop /></el-icon>
          <span>Campus Marketplace</span>
        </router-link>

        <!-- Search Bar -->
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="Search items..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-select v-model="selectedCategory" placeholder="All Categories" style="width: 130px">
                <el-option label="All Categories" value="" />
                <el-option label="Textbooks" value="books" />
                <el-option label="Electronics" value="electronics" />
                <el-option label="Daily Supplies" value="daily" />
                <el-option label="Sports & Fitness" value="sports" />
                <el-option label="Fashion" value="fashion" />
                <el-option label="Others" value="other" />
              </el-select>
            </template>
          </el-input>
        </div>

        <!-- Navigation Menu -->
        <div class="nav-menu">
          <router-link to="/publish" class="publish-btn">
            <el-button type="primary" :icon="Plus">Post Item</el-button>
          </router-link>

          <!-- Not logged in -->
          <template v-if="!isLoggedIn">
            <router-link to="/login">
              <el-button>Login</el-button>
            </router-link>
            <router-link to="/register">
              <el-button type="primary">Register</el-button>
            </router-link>
          </template>

          <!-- Logged in -->
          <template v-else>
            <!-- Message notifications -->
            <el-badge :value="unreadCount" :max="99" class="message-badge">
              <el-button :icon="Message" circle @click="showMessages = true" />
            </el-badge>

            <!-- User menu -->
            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-menu">
                <el-avatar :size="32" :src="userAvatar">
                  {{ userInitials }}
                </el-avatar>
                <span class="username">{{ username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>Profile
                  </el-dropdown-item>
                  <el-dropdown-item command="products">
                    <el-icon><Goods /></el-icon>My Items
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon>Favorites
                  </el-dropdown-item>
                  <el-dropdown-item command="messages">
                    <el-icon><Message /></el-icon>Messages
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>Settings
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>Logout
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </div>
      </nav>
    </div>

    <!-- Message Drawer -->
    <el-drawer
      v-model="showMessages"
      title="Message Center"
      direction="rtl"
      size="300px"
    >
      <el-tabs v-model="activeTab" class="message-tabs">
        <el-tab-pane label="Chats" name="chat">
          <div class="message-list">
            <div
              v-for="msg in chatMessages"
              :key="msg.id"
              class="message-item"
              :class="{ unread: !msg.read }"
              @click="handleMessageClick(msg)"
            >
              <el-avatar :size="40" :src="msg.sender.avatar">
                {{ msg.sender.name[0] }}
              </el-avatar>
              <div class="message-content">
                <div class="message-header">
                  <span class="sender-name">{{ msg.sender.name }}</span>
                  <span class="message-time">{{ formatTime(msg.time) }}</span>
                </div>
                <div class="message-text">{{ msg.content }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="Notifications" name="system">
          <div class="message-list">
            <div
              v-for="notice in systemNotices"
              :key="notice.id"
              class="message-item"
              :class="{ unread: !notice.read }"
            >
              <el-icon class="notice-icon" :class="notice.type">
                <component :is="getNoticeIcon(notice.type)" />
              </el-icon>
              <div class="message-content">
                <div class="message-header">
                  <span class="notice-title">{{ notice.title }}</span>
                  <span class="message-time">{{ formatTime(notice.time) }}</span>
                </div>
                <div class="message-text">{{ notice.content }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const router = useRouter()
const userStore = useUserStore()

const {
  Shop,
  Search,
  Plus,
  Message,
  CaretBottom,
  User,
  Goods,
  Star,
  Setting,
  SwitchButton,
  Bell,
  Warning,
  InfoFilled
} = ElementPlusIconsVue

// Search related
const searchQuery = ref('')
const selectedCategory = ref('')

// Message related
const showMessages = ref(false)
const activeTab = ref('chat')
const unreadCount = ref(5)

// Mock data
const chatMessages = ref([
  {
    id: 1,
    sender: {
      name: 'John Doe',
      avatar: ''
    },
    content: 'Is this item still available?',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false
  },
  {
    id: 2,
    sender: {
      name: 'Jane Smith',
      avatar: ''
    },
    content: 'Can you lower the price?',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: true
  }
])

const systemNotices = ref([
  {
    id: 1,
    type: 'success',
    title: 'Item Published',
    content: 'Your item "iPhone 12" has been successfully published',
    time: new Date(Date.now() - 1000 * 60 * 60),
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Item Expiring Soon',
    content: 'Your item "Data Structures Textbook" will be delisted soon',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true
  }
])

// Computed properties
const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.user?.username || '')
const userAvatar = computed(() => userStore.user?.avatar || '')
const userInitials = computed(() => {
  const name = userStore.user?.username || ''
  return name.charAt(0).toUpperCase()
})

// Methods
const handleSearch = () => {
  router.push({
    name: 'search',
    query: {
      q: searchQuery.value,
      category: selectedCategory.value
    }
  })
}

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push({ path: '/user', query: { tab: 'published' } })
      break
    case 'products':
      router.push({ path: '/user', query: { tab: 'published' } })
      break
    case 'favorites':
      router.push({ path: '/user', query: { tab: 'favorite' } })
      break
    case 'messages':
      router.push('/message')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      ElMessage.success('Logged out successfully')
      break
  }
}

const handleMessageClick = (message) => {
  if (!message.read) {
    message.read = true
    unreadCount.value--
  }
  router.push({
    name: 'user-messages',
    query: { chat: message.sender.name }
  })
}

const formatTime = (time) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: enUS
  })
}

const getNoticeIcon = (type) => {
  switch (type) {
    case 'success':
      return InfoFilled
    case 'warning':
      return Warning
    default:
      return Bell
  }
}
</script>

<style lang="scss" scoped>
.header {
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: none;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  .el-icon {
    font-size: 26px;
  }
}

.search-bar {
  flex: 1;
  max-width: 600px;
  margin: 0 40px;

  .search-input {
    width: 100%;
    :deep(.el-input__wrapper) {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 16px;

  .el-button {
    border-radius: 8px;
  }
}

.message-badge {
  margin-right: 8px;
  
  :deep(.el-badge__content) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-secondary);
  }

  .username {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 500;
  }

  .el-avatar {
    border: 2px solid var(--border-color);
  }
}

.message-tabs {
  height: 100%;
  
  :deep(.el-tabs__content) {
    padding: 16px;
    height: calc(100% - 55px);
    overflow-y: auto;
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  &.unread {
    background: var(--bg-accent);
    border-color: var(--primary-color);
  }
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.sender-name,
.notice-title {
  font-weight: 500;
  color: var(--text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--text-secondary);
}

.message-text {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.notice-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 20px;

  &.success {
    background: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
  }

  &.warning {
    background: rgba(241, 196, 15, 0.1);
    color: var(--warning-color);
  }
}

@media (max-width: 768px) {
  .search-bar {
    display: none;
  }

  .nav-menu {
    gap: 8px;
  }

  .publish-btn {
    .el-button span {
      display: none;
    }
  }

  .nav {
    padding: 0 12px;
  }

  .logo span {
    display: none;
  }
}
</style> 