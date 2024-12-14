<template>
  <div class="home-page">
    <!-- Carousel -->
    <section class="banner">
      <el-skeleton v-if="loading" :rows="3" animated />
      <template v-else>
        <el-carousel height="400px" :interval="5000" arrow="always">
          <el-carousel-item 
            v-for="item in banners" 
            :key="item.id"
            :style="{ background: item.bgColor }"
          >
            <div class="banner-content">
              <div class="banner-text">
                <h2>{{ item.title }}</h2>
                <p>{{ item.description }}</p>
                <el-button type="primary" size="large" @click="handleBannerClick(item)">
                  {{ item.buttonText }}
                </el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </template>
    </section>

    <!-- Categories -->
    <section class="categories section">
      <div class="container">
        <h2 class="section-title">Categories</h2>
        <p class="section-subtitle">Browse categories you're interested in and discover more great items</p>
        
        <el-skeleton v-if="loading" :count="8" />
        <template v-else>
          <div class="category-grid">
            <div
              v-for="category in categories"
              :key="category.id"
              class="category-card"
              @click="handleCategoryClick(category)"
            >
              <el-icon class="category-icon">
                <component :is="category.icon" />
              </el-icon>
              <h3>{{ category.name }}</h3>
              <p>{{ category.description }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured section">
      <div class="container">
        <div class="section-header">
          <div class="header-left">
            <h2 class="section-title">Featured Items</h2>
            <p class="section-subtitle">Recommended products for you</p>
          </div>
          <div class="header-right">
            <el-radio-group v-model="selectedTab" size="large">
              <el-radio-button value="all">All</el-radio-button>
              <el-radio-button value="new">Latest</el-radio-button>
              <el-radio-button value="hot">Popular</el-radio-button>
              <el-radio-button value="recommend">For You</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="product-grid">
          <el-skeleton v-if="loading" :count="8" />
          <el-empty
            v-else-if="filteredProducts.length === 0"
            description="No items found"
          >
            <template #extra>
              <el-button type="primary" @click="handleRefresh">Refresh</el-button>
            </template>
          </el-empty>
          <template v-else>
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-card"
              @click="handleProductClick(product)"
            >
              <div 
                class="product-image"
                :style="{ background: product.bgColor }"
              >
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="product-tags">
                  <span
                    v-for="tag in product.tags"
                    :key="tag"
                    class="tag"
                    :class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div class="product-info">
                <h3 class="product-title">{{ product.title }}</h3>
                <div class="product-meta">
                  <span class="price">${{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">
                    ${{ product.originalPrice }}
                  </span>
                </div>
                <div class="product-footer">
                  <span class="location">
                    <el-icon><Location /></el-icon>
                    {{ product.location }}
                  </span>
                  <span class="time">{{ formatTime(product.createTime) }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="load-more">
          <el-button
            v-if="hasMore"
            :loading="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? 'Loading...' : 'Load More' }}
          </el-button>
          <el-empty
            v-else
            description="No more items"
            :image-size="60"
          />
        </div>
      </div>
    </section>

    <!-- Platform Features -->
    <section class="features section">
      <div class="container">
        <h2 class="section-title">Why Choose Us</h2>
        <p class="section-subtitle">Benefits of our platform</p>

        <el-skeleton v-if="loading" :count="4" />
        <template v-else>
          <div class="features-grid">
            <div class="feature-card" v-for="feature in features" :key="feature.id">
              <div class="feature-icon">
                <component :is="feature.icon" />
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- Latest News -->
    <section class="news section">
      <div class="container">
        <h2 class="section-title">Latest News</h2>
        <p class="section-subtitle">Stay updated with platform news</p>

        <el-skeleton v-if="loading" :count="3" />
        <template v-else>
          <el-row :gutter="24">
            <el-col 
              :xs="24" 
              :sm="12" 
              :md="8" 
              v-for="news in newsList" 
              :key="news.id"
            >
              <div class="news-card" @click="handleNewsClick(news)">
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
            </el-col>
          </el-row>
        </template>
      </div>
    </section>

    <!-- Error Message -->
    <div v-if="error" class="error-container">
      <el-result
        icon="error"
        :title="error.message"
        :sub-title="error.description"
      >
        <template #extra>
          <el-button type="primary" @click="handleRefresh">Retry</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Location,
  Reading,
  Monitor,
  Box,
  Basketball,
  ShoppingBag,
  More,
  Check,
  Wallet,
  ChatRound,
  Medal,
  Picture
} from '@element-plus/icons-vue'
import { formatDistanceToNow, format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { ElMessage } from 'element-plus'

const router = useRouter()

// Banner data
const banners = [
  {
    id: 1,
    title: 'Campus Marketplace',
    description: 'Give your unused items a new life, make campus life better',
    buttonText: 'Get Started',
    link: '/categories',
    // TODO: Replace with actual banner images
    bgColor: '#e3f2fd'  // Temporary light blue background
  },
  {
    id: 2,
    title: 'Trustworthy Transactions',
    description: 'A safe and reliable trading environment, so you can buy and sell with confidence',
    buttonText: 'Learn More',
    link: '/about',
    // TODO: Replace with actual banner images
    bgColor: '#e8f5e9'  // Temporary light green background
  },
  {
    id: 3,
    title: 'Post Products',
    description: 'Quickly post your unused items, find their new owners',
    buttonText: 'Go Post',
    link: '/publish',
    // TODO: Replace with actual banner images
    bgColor: '#fff3e0'  // Temporary light orange background
  }
]

// Category data
const categories = [
  {
    id: 'books',
    name: 'Textbooks',
    icon: Reading,
    description: 'Secondhand textbooks, textbooks, and exam materials',
    link: '/category/books'
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: Monitor,
    description: 'Mobile phones, computers, and digital accessories',
    link: '/category/electronics'
  },
  {
    id: 'daily',
    name: 'Daily Necessities',
    icon: Box,
    description: 'Daily necessities and dormitory supplies',
    link: '/category/daily'
  },
  {
    id: 'sports',
    name: 'Sports and Fitness',
    icon: Basketball,
    description: 'Sports equipment and fitness equipment',
    link: '/category/sports'
  },
  {
    id: 'fashion',
    name: 'Fashion and Style',
    icon: ShoppingBag,
    description: 'Clothes, shoes, and accessories',
    link: '/category/fashion'
  },
  {
    id: 'others',
    name: 'Other Categories',
    icon: More,
    description: 'More product categories',
    link: '/categories'
  }
]

// Product data
const selectedTab = ref('all')
const loading = ref(true)
const loadingMore = ref(false)
const refreshing = ref(false)
const error = ref(null)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(12)
const total = ref(0)
const products = ref([])

// Load product data
const loadProducts = async () => {
  loading.value = true
  try {
    // TODO: Call API to get product list
    const params = {
      page: page.value,
      pageSize: pageSize.value,
      type: selectedTab.value
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Product card background colors
    const bgColors = [
      '#E3F2FD',  // Light blue
      '#F3E5F5',  // Light purple
      '#E8F5E9',  // Light green
      '#FFF3E0',  // Light orange
      '#F5F5F5',  // Light gray
      '#E1F5FE',  // Another light blue
      '#FCE4EC',  // Light pink
      '#F1F8E9',  // Another light green
      '#FFF8E1',  // Light yellow
      '#E8EAF6',  // Light indigo
      '#E0F2F1',  // Light teal
      '#FBE9E7'   // Light coral
    ]
    
    // Simulate data
    const mockProducts = Array(pageSize.value).fill(null).map((_, index) => ({
      id: String(Date.now() + index),
      title: `Product ${index + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      originalPrice: Math.floor(Math.random() * 2000) + 1000,
      location: 'Example University',
      createTime: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(),
      tags: ['95% New', 'Under Warranty'],
      bgColor: bgColors[index % bgColors.length]  // Cycle through background colors
    }))
    
    if (page.value === 1) {
      products.value = mockProducts
    } else {
      products.value.push(...mockProducts)
    }
    
    total.value = 100 // Simulate total
  } catch (error) {
    console.error('Failed to load products:', error)
    ElMessage.error('Failed to load product list, please try again')
  } finally {
    loading.value = false
  }
}

// Watch for tab changes
watch(selectedTab, () => {
  page.value = 1
  loadProducts()
})

// Load more
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  try {
    loadingMore.value = true
    page.value++
    await loadProducts()
  } finally {
    loadingMore.value = false
  }
}

// Refresh
const onRefresh = async () => {
  await loadProducts()
}

const handleRefresh = () => {
  refreshing.value = true
  onRefresh()
}

// Lifecycle
onMounted(() => {
  loadProducts()
})

// Platform features
const features = [
  {
    id: 1,
    icon: Check,
    title: 'Security Guarantee',
    description: 'Real name verification, campus trustworthy environment'
  },
  {
    id: 2,
    icon: Wallet,
    title: 'Guaranteed Transactions',
    description: 'Platform guarantee, no worries about transactions'
  },
  {
    id: 3,
    icon: ChatRound,
    title: 'Instant Communication',
    description: 'Buyers and sellers communicate online'
  },
  {
    id: 4,
    icon: Medal,
    title: 'Credit Evaluation',
    description: 'User credit system guarantee'
  }
]

// News data
const newsList = [
  {
    id: 1,
    title: 'Platform Updated',
    excerpt: 'To provide a better user experience, the platform has been upgraded...',
    category: 'Platform Announcement',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    // TODO: Replace with actual news images
    bgColor: '#fafafa'  // Temporary light gray background
  },
  {
    id: 2,
    title: 'Trustworthy Transactions Month Activity',
    excerpt: 'Participate in the activity to get credit points and have a chance to win big prizes...',
    category: 'Activity Information',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    // TODO: Replace with actual news images
    bgColor: '#f3e5f5'  // Temporary light purple background
  },
  {
    id: 3,
    title: 'Campus Secondhand Transaction Safety Guide',
    excerpt: 'To ensure transaction safety, we have compiled safety precautions for transactions...',
    category: 'Safety Reminder',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    // TODO: Replace with actual news images
    bgColor: '#e1f5fe'  // Temporary light blue background
  }
]

// Computed properties
const filteredProducts = computed(() => {
  switch (selectedTab.value) {
    case 'new':
      return [...products.value].sort((a, b) => b.createTime - a.createTime)
    case 'hot':
      return products.value // Actual should be sorted by views
    case 'recommend':
      return products.value // Actual should be sorted by user interest
    default:
      return products.value
  }
})

// Methods
const handleBannerClick = (banner) => {
  router.push(banner.link)
}

const handleCategoryClick = (category) => {
  router.push(category.link)
}

const handleProductClick = async (product) => {
  try {
    await router.push(`/product/${product.id}`)
  } catch (error) {
    console.error('Failed to navigate:', error)
    ElMessage.error('Failed to navigate, please try again')
  }
}

const handleNewsClick = (news) => {
  router.push(`/news/${news.id}`)
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
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-primary);
}

.section {
  padding: 60px 0;
  
  &:nth-child(even) {
    background: var(--bg-secondary);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 40px;
}

.banner {
  .banner-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
    
    .banner-text {
      max-width: 600px;
      
      h2 {
        font-size: 48px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 20px;
        line-height: 1.2;
      }
      
      p {
        font-size: 18px;
        color: var(--text-secondary);
        margin-bottom: 30px;
        line-height: 1.6;
      }
      
      .el-button {
        padding: 12px 36px;
        font-size: 18px;
      }
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.category-card {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
    
    .category-icon {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }
  
  .category-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    
    .header-left {
      margin-bottom: 20px;
    }
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.product-card {
  background: var(--bg-white);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
    
    .product-title {
      color: var(--primary-color);
    }
  }
  
  .product-image {
    aspect-ratio: 4/3;
    position: relative;
    overflow: hidden;
    
    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: var(--text-secondary);
      opacity: 0.5;
    }
    
    .product-tags {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 8px;
      
      .tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        background: rgba(255, 255, 255, 0.9);
        color: var(--primary-color);
      }
    }
  }
  
  .product-info {
    padding: 20px;
  }
  
  .product-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.4;
    transition: color 0.3s ease;
  }
  
  .product-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    .price {
      font-size: 20px;
      font-weight: bold;
      color: var(--price-color);
    }
    
    .original-price {
      font-size: 14px;
      color: var(--text-secondary);
      text-decoration: line-through;
    }
  }
  
  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
    
    .location {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

.feature-card {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
    
    .feature-icon {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }
  
  .feature-icon {
    font-size: 48px;
    color: var(--text-secondary);
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }
  
  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.news-card {
  background: var(--bg-white);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
    
    .news-title {
      color: var(--primary-color);
    }
  }
  
  .news-image {
    aspect-ratio: 16/9;
    position: relative;
    
    .news-category {
      position: absolute;
      bottom: 12px;
      left: 12px;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.9);
      color: var(--primary-color);
    }
  }
  
  .news-content {
    padding: 20px;
  }
  
  .news-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .news-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.4;
    transition: color 0.3s ease;
  }
  
  .news-excerpt {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.load-more {
  text-align: center;
  margin-top: 40px;
}

.error-container {
  padding: 60px 20px;
}

// Mobile device adaptation
@media (max-width: 768px) {
  .section {
    padding: 40px 0;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .section-subtitle {
    font-size: 14px;
    margin-bottom: 30px;
  }
  
  .banner {
    .banner-content {
      padding: 20px;
      
      .banner-text {
        h2 {
          font-size: 32px;
          margin-bottom: 16px;
        }
        
        p {
          font-size: 16px;
          margin-bottom: 24px;
        }
        
        .el-button {
          padding: 10px 24px;
          font-size: 16px;
        }
      }
    }
  }
  
  .category-grid,
  .product-grid,
  .features-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .category-card,
  .feature-card {
    padding: 24px;
  }
  
  .product-card {
    .product-info {
      padding: 16px;
    }
  }
  
  .news-card {
    margin-bottom: 24px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style> 