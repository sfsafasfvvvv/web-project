<template>
  <div class="search-result">
    <div class="container">
      <!-- Search Header -->
      <div class="search-header">
        <div class="search-info">
          <h1 class="search-title">Search Results</h1>
          <p class="search-stats">
            Found <span class="highlight">{{ total }}</span> items
          </p>
        </div>
        <div class="search-actions">
          <el-radio-group v-model="sortBy" size="large">
            <el-radio-button label="relevance">Relevance</el-radio-button>
            <el-radio-button label="latest">Latest</el-radio-button>
            <el-radio-button label="price-asc">Price: Low to High</el-radio-button>
            <el-radio-button label="price-desc">Price: High to Low</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- Search Results -->
      <div class="result-section">
        <!-- Filters -->
        <div class="filter-sidebar">
          <div class="filter-card">
            <h3>Categories</h3>
            <el-tree
              :data="categories"
              :props="defaultProps"
              @node-click="handleCategoryClick"
              :default-expanded-keys="['1']"
              :highlight-current="true"
            />
          </div>

          <div class="filter-card">
            <h3>Price Range</h3>
            <div class="price-range">
              <el-input-number
                v-model="minPrice"
                :min="0"
                :step="100"
                placeholder="Min"
              />
              <span class="separator">-</span>
              <el-input-number
                v-model="maxPrice"
                :min="0"
                :step="100"
                placeholder="Max"
              />
              <el-button type="primary" @click="applyPriceFilter">
                Apply
              </el-button>
            </div>
          </div>

          <div class="filter-card">
            <h3>Condition</h3>
            <el-checkbox-group v-model="conditions">
              <div class="checkbox-list">
                <el-checkbox label="100">Brand New</el-checkbox>
                <el-checkbox label="95">Like New</el-checkbox>
                <el-checkbox label="90">Very Good</el-checkbox>
                <el-checkbox label="80">Good</el-checkbox>
                <el-checkbox label="70">Acceptable</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>

          <div class="filter-card">
            <h3>Seller Rating</h3>
            <el-rate
              v-model="sellerRating"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            />
          </div>
        </div>

        <!-- Product List -->
        <div class="result-content">
          <div class="product-grid" v-if="products.length">
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card"
              @click="$router.push(`/product/${product.id}`)"
            >
              <div class="product-cover" :style="{ background: '#f5f5f5' }">
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
                <h3 class="title">{{ product.title }}</h3>
                <div class="price-info">
                  <span class="price">${{ product.price }}</span>
                  <span class="original-price" v-if="product.originalPrice">
                    ${{ product.originalPrice }}
                  </span>
                </div>
                <div class="meta">
                  <span class="location">
                    <el-icon><Location /></el-icon>
                    {{ product.location }}
                  </span>
                  <span class="time">{{ formatTime(product.createTime) }}</span>
                </div>
                <div class="seller">
                  <div class="seller-info">
                    <div class="seller-avatar" :style="{ background: '#f5f5f5' }">
                      {{ product.seller.username?.[0]?.toUpperCase() }}
                    </div>
                    <span class="seller-name">{{ product.seller.username }}</span>
                  </div>
                  <el-rate
                    v-model="product.seller.rating"
                    disabled
                    :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>
          <el-empty v-else description="No items found" />

          <!-- Pagination -->
          <div class="pagination" v-if="total > 0">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const route = useRoute()
const keyword = computed(() => route.query.keyword || '')

// Total results
const total = ref(128)

// Sort options
const sortBy = ref('relevance')

// Category tree
const categories = [
  {
    id: '1',
    label: 'All Categories',
    children: [
      {
        id: 'books',
        label: 'Books',
        children: [
          { id: 'textbook', label: 'Textbooks' },
          { id: 'reference', label: 'Study Materials' },
          { id: 'literature', label: 'Literature' }
        ]
      },
      {
        id: 'electronics',
        label: 'Electronics',
        children: [
          { id: 'phone', label: 'Phones' },
          { id: 'computer', label: 'Computers' },
          { id: 'accessories', label: 'Accessories' }
        ]
      },
      {
        id: 'daily',
        label: 'Daily Necessities',
        children: [
          { id: 'clothing', label: 'Clothing' },
          { id: 'cosmetics', label: 'Cosmetics' },
          { id: 'food', label: 'Food' }
        ]
      },
      {
        id: 'sports',
        label: 'Sports & Fitness',
        children: [
          { id: 'equipment', label: 'Equipment' },
          { id: 'clothing', label: 'Sportswear' },
          { id: 'shoes', label: 'Sports Shoes' }
        ]
      }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label'
}

// Price range
const minPrice = ref('')
const maxPrice = ref('')

// Product conditions
const conditions = ref([])

// Seller rating
const sellerRating = ref(0)

// Pagination
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

// Product list
const products = ref([
  {
    id: 1,
    title: 'iPhone 12',
    price: 599,
    originalPrice: 799,
    location: 'Library',
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    tags: ['Like New', 'Warranty'],
    seller: {
      username: 'John Doe',
      rating: 4.5
    }
  },
  {
    id: 2,
    title: 'MacBook Pro',
    price: 1299,
    location: 'Student Center',
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    tags: ['Good'],
    seller: {
      username: 'Jane Smith',
      rating: 5
    }
  }
])

// Load products
const loadProducts = async () => {
  loading.value = true
  try {
    // TODO: Call API to get product list
    const params = {
      keyword: keyword.value,
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      conditions: conditions.value,
      sellerRating: sellerRating.value
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock response
    // products.value = response.data
    // total.value = response.total
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

// Methods
const handleCategoryClick = (data) => {
  console.log('Selected category:', data)
  loadProducts()
}

const applyPriceFilter = () => {
  loadProducts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadProducts()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProducts()
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

// Watch for changes
watch([keyword, sortBy, conditions, sellerRating], () => {
  currentPage.value = 1
  loadProducts()
})

// Lifecycle
onMounted(() => {
  loadProducts()
})
</script>

<style lang="scss" scoped>
.search-result {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-info {
  .search-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .search-stats {
    font-size: 14px;
    color: var(--text-secondary);
    
    .highlight {
      color: var(--primary-color);
      font-weight: 600;
    }
  }
}

.result-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}

.filter-sidebar {
  .filter-card {
    background: var(--bg-white);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .separator {
    color: var(--text-secondary);
  }
  
  .el-input-number {
    width: 120px;
  }
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-content {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.product-card {
  background: var(--bg-white);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .product-cover {
    aspect-ratio: 1;
    position: relative;
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
  
  .product-info {
    padding: 16px;
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
      line-height: 1.4;
    }
    
    .price-info {
      margin-bottom: 12px;
      
      .price {
        font-size: 20px;
        font-weight: 600;
        color: var(--price-color);
      }
      
      .original-price {
        font-size: 14px;
        color: var(--text-secondary);
        text-decoration: line-through;
        margin-left: 8px;
      }
    }
    
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 12px;
      
      .location {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
    
    .seller {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .seller-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .seller-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        
        .seller-name {
          font-size: 14px;
          color: var(--text-primary);
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .search-result {
    padding: 20px 0;
  }
  
  .search-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .result-section {
    grid-template-columns: 1fr;
  }
  
  .filter-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-white);
    z-index: 100;
    padding: 20px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.active {
      transform: translateX(0);
    }
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style> 