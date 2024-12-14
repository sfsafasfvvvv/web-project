<template>
  <div class="news-list-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Platform Updates</h1>
        <div class="filter-bar">
          <el-radio-group v-model="selectedCategory" size="large">
            <el-radio-button value="all">All</el-radio-button>
            <el-radio-button value="announcement">Announcements</el-radio-button>
            <el-radio-button value="activity">Activities</el-radio-button>
            <el-radio-button value="guide">Safety Guides</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="news-grid">
        <el-empty
          v-if="!loading && filteredNews.length === 0"
          description="No news available"
        />
        <el-skeleton-item
          v-else-if="loading"
          v-for="i in pageSize"
          :key="i"
          variant="card"
          style="width: 100%; height: 300px;"
        />
        <div 
          v-else
          v-for="news in filteredNews" 
          :key="news.id"
          class="news-card"
          @click="handleNewsClick(news)"
        >
          <div 
            class="news-image"
            :style="{ background: news.bgColor }"
          >
            <div class="news-category">{{ news.category }}</div>
          </div>
          <div class="news-content">
            <div class="news-meta">
              <span class="category">{{ news.category }}</span>
              <span class="date">{{ formatDate(news.date) }}</span>
            </div>
            <h3 class="news-title">{{ news.title }}</h3>
            <p class="news-excerpt">{{ news.excerpt }}</p>
          </div>
        </div>
      </div>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 36, 48]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ElMessage } from 'element-plus'

const router = useRouter()

// State
const selectedCategory = ref('all')
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(100)
const loading = ref(false)
const newsList = ref([
  {
    id: 1,
    title: 'Platform Redesign Launch',
    excerpt: 'To provide a better user experience, the platform has undergone a complete redesign...',
    category: 'Announcements',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    bgColor: '#fafafa'
  },
  {
    id: 2,
    title: 'Trust Trading Month Campaign',
    excerpt: 'Participate to earn credit points and get a chance to win great prizes...',
    category: 'Activities',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    bgColor: '#f3e5f5'
  },
  {
    id: 3,
    title: 'Campus Trading Safety Guide',
    excerpt: 'To ensure safe transactions, we have compiled important safety tips...',
    category: 'Safety Guides',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    bgColor: '#e1f5fe'
  }
])

// Computed properties
const filteredNews = computed(() => {
  if (selectedCategory.value === 'all') {
    return newsList.value
  }
  return newsList.value.filter(news => {
    switch (selectedCategory.value) {
      case 'announcement':
        return news.category === 'Announcements'
      case 'activity':
        return news.category === 'Activities'
      case 'guide':
        return news.category === 'Safety Guides'
      default:
        return true
    }
  })
})

// Methods
const handleNewsClick = async (news) => {
  try {
    await router.push(`/news/${news.id}`)
  } catch (error) {
    console.error('Failed to navigate:', error)
    ElMessage.error('Failed to navigate, please try again')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadNews()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadNews()
}

const loadNews = async () => {
  loading.value = true
  try {
    // TODO: API call to get news list should be implemented here
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Using mock data for now
    total.value = newsList.value.length
  } catch (error) {
    console.error('Failed to load news:', error)
    ElMessage.error('Failed to load news list, please try again')
  } finally {
    loading.value = false
  }
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

// Watch category changes
watch(selectedCategory, () => {
  currentPage.value = 1
  loadNews()
})

// Initial load
loadNews()
</script>

<style lang="scss" scoped>
.news-list-page {
  padding: 40px 0;
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 32px;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.filter-bar {
  margin-bottom: 32px;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.news-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
}

.news-image {
  height: 200px;
  border-radius: var(--radius-lg);
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.news-category {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
}

.news-content {
  padding: 20px;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;

  .category {
    color: var(--primary-color);
  }

  .date {
    color: var(--text-secondary);
  }
}

.news-title {
  font-size: 18px;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.news-excerpt {
  font-size: 14px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 1200px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style> 