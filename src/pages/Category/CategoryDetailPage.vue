<template>
  <div class="category-detail">
    <div class="container">
      <!-- Category Header -->
      <div class="category-header">
        <div class="header-left">
          <h1 class="category-title">{{ categoryInfo.name }}</h1>
          <p class="category-description">{{ categoryInfo.description }}</p>
        </div>
        <div class="header-right">
          <el-radio-group v-model="sortBy" size="large">
            <el-radio-button label="latest">Latest</el-radio-button>
            <el-radio-button label="price-asc">Price: Low to High</el-radio-button>
            <el-radio-button label="price-desc">Price: High to Low</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- Filters -->
      <div class="filter-section">
        <div class="filter-group">
          <span class="label">Price Range:</span>
          <el-radio-group v-model="priceRange" size="default">
            <el-radio-button label="all">All</el-radio-button>
            <el-radio-button label="0-100">$0-100</el-radio-button>
            <el-radio-button label="100-500">$100-500</el-radio-button>
            <el-radio-button label="500-2000">$500-2000</el-radio-button>
            <el-radio-button label="2000+">$2000+</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group">
          <span class="label">Condition:</span>
          <el-checkbox-group v-model="conditions">
            <el-checkbox label="100">Brand New</el-checkbox>
            <el-checkbox label="95">Like New</el-checkbox>
            <el-checkbox label="90">Very Good</el-checkbox>
            <el-checkbox label="80">Good</el-checkbox>
            <el-checkbox label="70">Acceptable</el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="filter-group">
          <span class="label">Tags:</span>
          <div class="tag-list">
            <el-tag
              v-for="tag in filterTags"
              :key="tag.value"
              :type="tag.type"
              class="tag-item"
              :class="{ active: selectedTags.includes(tag.value) }"
              @click="toggleTag(tag.value)"
            >
              {{ tag.label }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- Product List -->
      <div class="product-section">
        <div class="product-grid" v-if="products.length">
          <div
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div 
              class="product-cover" 
              :style="{ background: product.bgColor }"
            >
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
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Location } from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const route = useRoute()

// Category info
const categoryInfo = computed(() => {
  const category = route.params.category
  return {
    name: getCategoryName(category),
    description: getCategoryDescription(category)
  }
})

// Sort options
const sortBy = ref('latest')

// Price range
const priceRange = ref('all')

// Product conditions
const conditions = ref([])

// Tag filters
const filterTags = [
  { label: 'Free Shipping', value: 'free_shipping', type: '' },
  { label: 'Warranty', value: 'warranty', type: 'success' },
  { label: 'Authentic', value: 'authentic', type: 'warning' },
  { label: 'Complete Set', value: 'complete', type: 'info' }
]
const selectedTags = ref([])

// Pagination
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)
const loading = ref(false)

// Product list
const products = ref([])

// Get category name
const getCategoryName = (category) => {
  const categoryMap = {
    books: 'Books',
    electronics: 'Electronics',
    daily: 'Daily Necessities',
    sports: 'Sports & Fitness',
    fashion: 'Fashion',
    others: 'Other Categories'
  }
  return categoryMap[category] || category
}

// Get category description
const getCategoryDescription = (category) => {
  const descriptionMap = {
    books: 'Textbooks, study materials, and literature',
    electronics: 'Phones, computers, and accessories',
    daily: 'Daily supplies and dormitory items',
    sports: 'Sports equipment and fitness gear',
    fashion: 'Clothing, shoes, and accessories',
    others: 'More product categories'
  }
  return descriptionMap[category] || ''
}

// Toggle tag
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// Load products
const loadProducts = async () => {
  loading.value = true
  try {
    // TODO: Call API to get product list
    const params = {
      category: route.params.category,
      page: currentPage.value,
      pageSize: pageSize.value,
      sortBy: sortBy.value,
      priceRange: priceRange.value,
      conditions: conditions.value,
      tags: selectedTags.value
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock data
    const mockProducts = Array(pageSize.value).fill(null).map((_, index) => ({
      id: Date.now() + index,
      title: `${categoryInfo.value.name} Item ${index + 1}`,
      price: Math.floor(Math.random() * 1000) + 100,
      originalPrice: Math.floor(Math.random() * 2000) + 1000,
      location: 'Example University',
      createTime: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7),
      tags: ['Like New', 'Warranty'],
      bgColor: '#f5f5f5'
    }))
    
    products.value = mockProducts
    total.value = 100 // Mock total
  } catch (error) {
    console.error('Failed to load products:', error)
  } finally {
    loading.value = false
  }
}

// Handle pagination
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProducts()
}

// Format time
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
watch([sortBy, priceRange, conditions, selectedTags], () => {
  currentPage.value = 1
  loadProducts()
})

// Lifecycle
onMounted(() => {
  loadProducts()
})
</script>

<style lang="scss" scoped>
.category-detail {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.category-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  .category-title {
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  .category-description {
    font-size: 16px;
    color: var(--text-secondary);
  }
}

.filter-section {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    margin-right: 16px;
    min-width: 100px;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag-item {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &.active {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.product-section {
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
      
      .location {
        display: flex;
        align-items: center;
        gap: 4px;
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
  .category-detail {
    padding: 20px 0;
  }
  
  .category-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-left {
    .category-title {
      font-size: 24px;
    }
  }
  
  .filter-section {
    padding: 16px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .label {
      margin-right: 0;
      margin-bottom: 8px;
    }
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style> 