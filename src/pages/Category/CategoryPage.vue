<template>
  <div class="category-page">
    <div class="container">
      <!-- Category Navigation -->
      <section class="category-nav">
        <h2 class="section-title">Categories</h2>
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
      </section>

      <!-- Popular Categories -->
      <section class="hot-categories">
        <h2 class="section-title">Popular Categories</h2>
        <div class="tag-cloud">
          <el-tag
            v-for="tag in hotCategories"
            :key="tag.id"
            :type="tag.type"
            class="tag-item"
            @click="handleTagClick(tag)"
          >
            {{ tag.name }}
            <span class="count">({{ tag.count }})</span>
          </el-tag>
        </div>
      </section>

      <!-- Recommended Products -->
      <section class="recommended">
        <div class="section-header">
          <h2 class="section-title">Recommended for You</h2>
          <el-button type="primary" text @click="loadMore">
            View More<el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>

        <div class="product-grid">
          <div
            v-for="product in recommendedProducts"
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
              <div class="price">${{ product.price }}</div>
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
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Location,
  Reading,
  Monitor,
  Box,
  Basketball,
  ShoppingBag,
  More,
  ArrowRight
} from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const router = useRouter()

// Category data
const categories = [
  {
    id: 1,
    name: 'Books',
    icon: Reading,
    description: 'Textbooks, study materials, and literature',
    link: '/categories/books'
  },
  {
    id: 2,
    name: 'Electronics',
    icon: Monitor,
    description: 'Phones, computers, and accessories',
    link: '/categories/electronics'
  },
  {
    id: 3,
    name: 'Daily Necessities',
    icon: Box,
    description: 'Daily supplies and dormitory items',
    link: '/categories/daily'
  },
  {
    id: 4,
    name: 'Sports & Fitness',
    icon: Basketball,
    description: 'Sports equipment and fitness gear',
    link: '/categories/sports'
  },
  {
    id: 5,
    name: 'Fashion',
    icon: ShoppingBag,
    description: 'Clothing, shoes, and accessories',
    link: '/categories/fashion'
  },
  {
    id: 6,
    name: 'Other Categories',
    icon: More,
    description: 'More product categories',
    link: '/categories/others'
  }
]

// Popular categories
const hotCategories = [
  { id: 1, name: 'iPhone', count: 328, type: '' },
  { id: 2, name: 'Study Materials', count: 256, type: 'success' },
  { id: 3, name: 'Bicycles', count: 189, type: 'warning' },
  { id: 4, name: 'Headphones', count: 167, type: 'info' },
  { id: 5, name: 'Basketball', count: 145, type: 'danger' },
  { id: 6, name: 'Textbooks', count: 134, type: '' },
  { id: 7, name: 'Watches', count: 98, type: 'success' },
  { id: 8, name: 'Keyboards', count: 87, type: 'warning' }
]

// Recommended products
const recommendedProducts = ref([
  {
    id: 1,
    title: 'iPhone 12',
    price: 599,
    location: 'Example University',
    createTime: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['Like New', 'Warranty']
  },
  {
    id: 2,
    title: 'Data Structures and Algorithms',
    price: 20,
    location: 'Example University',
    createTime: new Date(Date.now() - 1000 * 60 * 60),
    tags: ['Used Books']
  }
])

// Handle category click
const handleCategoryClick = (category) => {
  router.push(category.link)
}

// Handle tag click
const handleTagClick = (tag) => {
  router.push({
    name: 'category-detail',
    params: { category: tag.name.toLowerCase() }
  })
}

// Load more
const loadMore = () => {
  // TODO: Implement load more logic
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
</script>

<style lang="scss" scoped>
.category-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.category-card {
  background: var(--bg-white);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);

    .category-icon {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }

  .category-icon {
    font-size: 40px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    transition: all 0.3s ease;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
}

.hot-categories {
  margin-bottom: 48px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .tag-item {
    cursor: pointer;
    padding: 8px 16px;
    font-size: 14px;
    border-radius: 20px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    .count {
      margin-left: 4px;
      opacity: 0.8;
    }
  }
}

.recommended {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
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

    .price {
      font-size: 20px;
      font-weight: 600;
      color: var(--price-color);
      margin-bottom: 12px;
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

@media (max-width: 768px) {
  .category-page {
    padding: 20px 0;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style> 