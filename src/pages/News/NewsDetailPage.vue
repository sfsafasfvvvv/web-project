<template>
  <div class="news-detail-page">
    <div class="container">
      <div class="back-button">
        <el-button icon="Back" @click="router.back()">Back</el-button>
      </div>
      
      <div class="news-header">
        <div class="news-meta">
          <span class="category">{{ news.category }}</span>
          <span class="date">{{ formatDate(news.date) }}</span>
        </div>
        <h1 class="news-title">{{ news.title }}</h1>
        <div class="news-info">
          <span class="views">
            <el-icon><View /></el-icon>
            {{ news.views }} views
          </span>
          <span class="likes">
            <el-icon><Star /></el-icon>
            {{ news.likes }} favorites
          </span>
          <span class="shares">
            <el-icon><Share /></el-icon>
            {{ news.shares }} shares
          </span>
        </div>
      </div>

      <div 
        class="news-cover"
        :style="{ background: news.bgColor }"
      ></div>

      <div class="news-content">
        <div class="content" v-html="news.content"></div>
      </div>

      <div class="comments-section">
        <h3>Comments ({{ comments.length }})</h3>
        
        <!-- Comment Input -->
        <div class="comment-input" v-if="isAuthenticated">
          <el-input
            v-model="newComment"
            type="textarea"
            :rows="3"
            placeholder="Write your comment..."
          />
          <el-button 
            type="primary"
            :loading="submittingComment"
            @click="submitComment"
          >
            Post Comment
          </el-button>
        </div>
        <el-button v-else type="primary" @click="goToLogin">Login to Comment</el-button>

        <!-- Comments List -->
        <div class="comments-list">
          <div 
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <el-avatar :src="comment.avatar" />
            <div class="comment-content">
              <div class="comment-header">
                <span class="username">{{ comment.username }}</span>
                <span class="date">{{ formatDate(comment.date) }}</span>
              </div>
              <p class="comment-text">{{ comment.content }}</p>
              <div class="comment-actions">
                <span @click="likeComment(comment)">
                  <el-icon><Pointer /></el-icon>
                  {{ comment.likes }}
                </span>
                <span @click="replyComment(comment)">
                  <el-icon><ChatRound /></el-icon>
                  Reply
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="news-footer">
        <div class="actions">
          <el-button
            type="primary"
            :icon="isLiked ? 'Star' : 'StarFilled'"
            @click="toggleLike"
          >
            {{ isLiked ? 'Favorited' : 'Favorite' }}
          </el-button>
          <el-button
            type="primary"
            plain
            icon="Share"
            @click="showShareDialog"
          >
            Share
          </el-button>
        </div>

        <div class="related-news">
          <h3>Related News</h3>
          <div class="news-list">
            <div
              v-for="item in relatedNews"
              :key="item.id"
              class="news-item"
              @click="handleNewsClick(item)"
            >
              <div 
                class="news-image"
                :style="{ background: item.bgColor }"
              ></div>
              <div class="news-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.excerpt }}</p>
                <span class="date">{{ formatDate(item.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Dialog -->
    <el-dialog
      v-model="shareDialogVisible"
      title="Share News"
      width="360px"
    >
      <div class="share-options">
        <div
          v-for="option in shareOptions"
          :key="option.type"
          class="share-option"
          @click="handleShare(option.type)"
        >
          <el-icon>
            <component :is="option.icon" />
          </el-icon>
          <span>{{ option.label }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { 
  View,
  Star,
  StarFilled,
  Share,
  ChatRound,
  Link,
  Position,
  Back,
  Pointer
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const loading = ref(false)
const isLiked = ref(false)
const shareDialogVisible = ref(false)
const submittingComment = ref(false)
const newComment = ref('')
const comments = ref([])

const isAuthenticated = computed(() => userStore.isAuthenticated)

// News data
const news = ref({})
const relatedNews = ref([])

// Share options
const shareOptions = [
  {
    type: 'wechat',
    label: 'WeChat',
    icon: ChatRound
  },
  {
    type: 'link',
    label: 'Copy Link',
    icon: Link
  },
  {
    type: 'qrcode',
    label: 'QR Code',
    icon: Position
  }
]

// Methods
const loadNews = async () => {
  loading.value = true
  try {
    const id = route.params.id
    // TODO: API call to get news details should be implemented here
    // Using mock data for now
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    news.value = {
      id: Number(id),
      title: 'Platform Redesign Launch',
      category: 'Announcements',
      date: new Date().toISOString(),
      views: 1234,
      likes: 56,
      shares: 23,
      bgColor: '#fafafa',
      content: `
        <p>To provide a better user experience, the platform has undergone a complete redesign...</p>
        <h3>1. Interface Optimization</h3>
        <p>Adopting a new design language for a cleaner, more beautiful interface and smoother operation.</p>
        <h3>2. Feature Updates</h3>
        <p>Added multiple practical features to enhance user experience.</p>
        <h3>3. Performance Improvements</h3>
        <p>Optimized system performance for faster response times.</p>
      `
    }
    
    // Mock comments data
    comments.value = [
      {
        id: 1,
        username: 'User1',
        avatar: 'https://example.com/avatar1.jpg',
        content: 'The interface looks much better!',
        date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        likes: 5
      },
      {
        id: 2,
        username: 'User2',
        avatar: 'https://example.com/avatar2.jpg',
        content: 'Great improvements!',
        date: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        likes: 3
      }
    ]

    // Mock related news
    relatedNews.value = [
      {
        id: 1,
        title: 'Trust Trading Month Campaign',
        excerpt: 'Participate to earn credit points and win prizes...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        bgColor: '#f3e5f5'
      },
      {
        id: 2,
        title: 'Campus Trading Safety Guide',
        excerpt: 'Important safety tips for campus trading...',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        bgColor: '#e1f5fe'
      }
    ]
  } catch (error) {
    console.error('Failed to load news:', error)
    ElMessage.error('Failed to load news details, please try again')
  } finally {
    loading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('Please enter your comment')
    return
  }

  submittingComment.value = true
  try {
    // TODO: API call to submit comment should be implemented here
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    comments.value.unshift({
      id: Date.now(),
      username: userStore.username,
      avatar: userStore.avatar,
      content: newComment.value,
      date: new Date().toISOString(),
      likes: 0
    })
    
    newComment.value = ''
    ElMessage.success('Comment posted successfully')
  } catch (error) {
    console.error('Failed to submit comment:', error)
    ElMessage.error('Failed to post comment, please try again')
  } finally {
    submittingComment.value = false
  }
}

const likeComment = async (comment) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('Please login to like comments')
    return
  }

  try {
    // TODO: API call to like comment should be implemented here
    comment.likes++
    ElMessage.success('Liked successfully')
  } catch (error) {
    console.error('Failed to like comment:', error)
    ElMessage.error('Failed to like comment, please try again')
  }
}

const replyComment = (comment) => {
  if (!isAuthenticated.value) {
    ElMessage.warning('Please login to reply to comments')
    return
  }

  newComment.value = `@${comment.username} `
}

const toggleLike = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('Please login to favorite news')
    return
  }

  try {
    // TODO: API call to toggle like should be implemented here
    isLiked.value = !isLiked.value
    if (isLiked.value) {
      news.value.likes++
      ElMessage.success('Added to favorites')
    } else {
      news.value.likes--
      ElMessage.success('Removed from favorites')
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    ElMessage.error('Operation failed, please try again')
  }
}

const showShareDialog = () => {
  shareDialogVisible.value = true
}

const handleShare = async (type) => {
  try {
    switch (type) {
      case 'wechat':
        ElMessage.success('WeChat sharing feature coming soon')
        break
      case 'link':
        await navigator.clipboard.writeText(window.location.href)
        ElMessage.success('Link copied to clipboard')
        break
      case 'qrcode':
        ElMessage.success('QR code sharing feature coming soon')
        break
    }
  } catch (error) {
    console.error('Failed to share:', error)
    ElMessage.error('Share failed, please try again')
  } finally {
    shareDialogVisible.value = false
  }
}

const handleNewsClick = (item) => {
  router.push(`/news/${item.id}`)
}

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

const formatDate = (date) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'yyyy-MM-dd', {
      locale: enUS
    })
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}

// Initial load
onMounted(() => {
  loadNews()
})
</script>

<style lang="scss" scoped>
.news-detail-page {
  padding: 40px 0;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  margin-bottom: 24px;
}

.news-header {
  margin-bottom: 32px;
  text-align: center;

  .news-meta {
    margin-bottom: 16px;
    color: var(--text-secondary);
    font-size: 14px;

    .category {
      margin-right: 16px;
    }
  }

  .news-title {
    font-size: 32px;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .news-info {
    display: flex;
    justify-content: center;
    gap: 24px;
    color: var(--text-secondary);
    font-size: 14px;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.news-cover {
  height: 400px;
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
  background-size: cover;
  background-position: center;
}

.news-content {
  margin-bottom: 48px;

  .content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--text-primary);

    h3 {
      font-size: 20px;
      margin: 24px 0 16px;
    }

    p {
      margin-bottom: 16px;
    }
  }
}

.comments-section {
  margin-bottom: 48px;

  h3 {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .comment-input {
    margin-bottom: 32px;

    .el-button {
      margin-top: 16px;
    }
  }
}

.comments-list {
  .comment-item {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;

    .comment-content {
      flex: 1;

      .comment-header {
        margin-bottom: 8px;

        .username {
          font-weight: 500;
          margin-right: 12px;
        }

        .date {
          color: var(--text-secondary);
          font-size: 12px;
        }
      }

      .comment-text {
        margin-bottom: 12px;
        line-height: 1.6;
      }

      .comment-actions {
        color: var(--text-secondary);
        font-size: 14px;

        span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-right: 16px;
          cursor: pointer;

          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }
  }
}

.news-footer {
  .actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 48px;
  }
}

.related-news {
  h3 {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .news-list {
    display: grid;
    gap: 24px;
  }

  .news-item {
    display: flex;
    gap: 16px;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      transform: translateY(-2px);
    }

    .news-image {
      width: 120px;
      height: 80px;
      border-radius: var(--radius-md);
      flex-shrink: 0;
    }

    .news-info {
      flex: 1;

      h4 {
        font-size: 16px;
        margin-bottom: 8px;
        color: var(--text-primary);
      }

      p {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 8px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .date {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.share-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;

  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      background: var(--bg-secondary);
    }

    .el-icon {
      font-size: 24px;
      color: var(--primary-color);
    }

    span {
      font-size: 14px;
      color: var(--text-primary);
    }
  }
}

@media (max-width: 768px) {
  .news-detail-page {
    padding: 20px 0;
  }

  .news-header {
    .news-title {
      font-size: 24px;
    }
  }

  .news-cover {
    height: 200px;
  }

  .news-footer {
    .actions {
      flex-direction: column;
      
      .el-button {
        width: 100%;
      }
    }
  }

  .related-news {
    .news-item {
      .news-image {
        width: 80px;
        height: 60px;
      }
    }
  }
}
</style> 