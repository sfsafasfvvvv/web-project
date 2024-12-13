<template>
  <div class="user-center">
    <div class="container">
      <div class="user-container">
        <!-- User Info Card -->
        <div class="user-card">
          <div class="user-header">
            <div class="user-avatar" :style="{ background: '#f5f5f5' }">
              {{ userInfo.username?.[0]?.toUpperCase() }}
            </div>
            <div class="user-info">
              <h2>{{ userInfo.username }}</h2>
              <p>{{ userInfo.school }}</p>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="value">{{ userInfo.creditScore }}</span>
                  <span class="label">Credit Score</span>
                </div>
                <div class="stat-item" @click="$router.push(`/user/${userInfo.id}/following`)">
                  <span class="value">{{ userInfo.followCount }}</span>
                  <span class="label">Following</span>
                </div>
                <div class="stat-item" @click="$router.push(`/user/${userInfo.id}/followers`)">
                  <span class="value">{{ userInfo.fansCount }}</span>
                  <span class="label">Followers</span>
                </div>
              </div>
            </div>
            <div class="user-actions">
              <el-button type="primary" @click="handleEdit">
                Edit Profile
              </el-button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <el-tabs v-model="activeTab" class="user-tabs">
            <!-- My Posts -->
            <el-tab-pane label="My Posts" name="published">
              <div class="product-grid" v-if="publishedProducts.length">
                <div
                  v-for="item in publishedProducts"
                  :key="item.id"
                  class="product-item"
                >
                  <div class="product-cover" :style="{ background: '#f5f5f5' }">
                    <div class="product-status" :class="item.status">
                      {{ getStatusText(item.status) }}
                    </div>
                  </div>
                  <div class="product-info">
                    <h3 class="title">{{ item.title }}</h3>
                    <div class="price">${{ item.price }}</div>
                    <div class="meta">
                      <span>{{ formatTime(item.createTime) }}</span>
                      <span>{{ item.views }} views</span>
                    </div>
                    <div class="actions">
                      <template v-if="item.status === 'active'">
                        <el-button
                          type="primary"
                          link
                          @click="handleEdit(item.id)"
                        >
                          Edit
                        </el-button>
                        <el-button
                          type="danger"
                          link
                          @click="handleOffShelf(item.id)"
                        >
                          Remove
                        </el-button>
                      </template>
                      <template v-else-if="item.status === 'removed'">
                        <el-button
                          type="primary"
                          link
                          @click="handleOnShelf(item.id)"
                        >
                          Repost
                        </el-button>
                        <el-button
                          type="danger"
                          link
                          @click="handleDelete(item.id)"
                        >
                          Delete
                        </el-button>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty
                v-else
                description="No items posted yet"
              >
                <el-button type="primary" @click="$router.push('/publish')">
                  Post Item
                </el-button>
              </el-empty>
            </el-tab-pane>

            <!-- Sold Items -->
            <el-tab-pane label="Sold Items" name="sold">
              <div class="order-list" v-if="soldOrders.length">
                <div
                  v-for="order in soldOrders"
                  :key="order.id"
                  class="order-item"
                >
                  <div class="order-product">
                    <div class="product-cover" :style="{ background: '#f5f5f5' }"></div>
                    <div class="product-info">
                      <h3>{{ order.product.title }}</h3>
                      <div class="price">${{ order.product.price }}</div>
                    </div>
                  </div>
                  <div class="order-info">
                    <div class="buyer-info">
                      <div class="user-avatar small" :style="{ background: '#f5f5f5' }">
                        {{ order.buyer.username?.[0]?.toUpperCase() }}
                      </div>
                      <span class="username">{{ order.buyer.username }}</span>
                    </div>
                    <div class="trade-info">
                      <div class="method">{{ order.tradeMethod }}</div>
                      <div class="location">{{ order.location }}</div>
                      <div class="time">{{ formatTime(order.dealTime) }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="No items sold yet" />
            </el-tab-pane>

            <!-- Purchased Items -->
            <el-tab-pane label="Purchased Items" name="bought">
              <div class="order-list" v-if="boughtOrders.length">
                <div
                  v-for="order in boughtOrders"
                  :key="order.id"
                  class="order-item"
                >
                  <div class="order-product">
                    <div class="product-cover" :style="{ background: '#f5f5f5' }"></div>
                    <div class="product-info">
                      <h3>{{ order.product.title }}</h3>
                      <div class="price">${{ order.product.price }}</div>
                    </div>
                  </div>
                  <div class="order-info">
                    <div class="seller-info">
                      <div class="user-avatar small" :style="{ background: '#f5f5f5' }">
                        {{ order.seller.username?.[0]?.toUpperCase() }}
                      </div>
                      <span class="username">{{ order.seller.username }}</span>
                    </div>
                    <div class="trade-info">
                      <div class="method">{{ order.tradeMethod }}</div>
                      <div class="location">{{ order.location }}</div>
                      <div class="time">{{ formatTime(order.dealTime) }}</div>
                    </div>
                    <div class="order-actions">
                      <el-button
                        v-if="!order.isRated"
                        type="primary"
                        link
                        @click="handleRate(order)"
                      >
                        Rate
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="No items purchased yet" />
            </el-tab-pane>

            <!-- Favorites -->
            <el-tab-pane label="Favorites" name="favorite">
              <div class="product-grid" v-if="favoriteProducts.length">
                <div
                  v-for="item in favoriteProducts"
                  :key="item.id"
                  class="product-item"
                  @click="$router.push(`/product/${item.id}`)"
                >
                  <div class="product-cover" :style="{ background: '#f5f5f5' }"></div>
                  <div class="product-info">
                    <h3 class="title">{{ item.title }}</h3>
                    <div class="price">${{ item.price }}</div>
                    <div class="meta">
                      <span>{{ formatTime(item.createTime) }}</span>
                      <span>{{ item.views }} views</span>
                    </div>
                  </div>
                </div>
              </div>
              <el-empty v-else description="No favorite items yet" />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <!-- Rating Dialog -->
    <el-dialog
      v-model="rateDialogVisible"
      title="Rate Item"
      width="500px"
    >
      <el-form
        ref="rateFormRef"
        :model="rateForm"
        :rules="rateRules"
        label-width="80px"
      >
        <el-form-item label="Rating" prop="rating">
          <el-rate
            v-model="rateForm.rating"
            :max="5"
            :texts="['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']"
            show-text
          />
        </el-form-item>
        <el-form-item label="Comment" prop="comment">
          <el-input
            v-model="rateForm.comment"
            type="textarea"
            :rows="4"
            placeholder="Please enter your review (10-200 characters)"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rateDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitRate">Submit</el-button>
      </template>
    </el-dialog>

    <!-- Edit Profile Dialog -->
    <el-dialog
      v-model="editDialogVisible"
      title="Edit Profile"
      width="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="Username" prop="username">
          <el-input
            v-model="editForm.username"
            placeholder="Enter username"
          />
        </el-form-item>
        <el-form-item label="School" prop="school">
          <el-select
            v-model="editForm.school"
            placeholder="Select school"
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
        <el-form-item label="Bio" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="4"
            placeholder="Tell us about yourself"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitEdit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// State
const activeTab = ref('published')
const rateDialogVisible = ref(false)
const editDialogVisible = ref(false)
const loading = ref(false)

// Forms
const rateFormRef = ref(null)
const editFormRef = ref(null)
const rateForm = ref({
  rating: 5,
  comment: ''
})
const editForm = ref({
  username: '',
  school: '',
  bio: ''
})

// Mock data
const userInfo = ref({
  id: 1,
  username: 'John Doe',
  school: 'Example University',
  creditScore: 100,
  followCount: 10,
  fansCount: 20
})

const publishedProducts = ref([
  {
    id: 1,
    title: 'iPhone 12',
    price: 599,
    status: 'active',
    views: 100,
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 2,
    title: 'MacBook Pro',
    price: 1299,
    status: 'sold',
    views: 200,
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  }
])

const soldOrders = ref([
  {
    id: 1,
    product: {
      title: 'iPhone 12',
      price: 599
    },
    buyer: {
      username: 'Jane Smith'
    },
    tradeMethod: 'Meet on Campus',
    location: 'Library',
    dealTime: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
])

const boughtOrders = ref([
  {
    id: 1,
    product: {
      title: 'MacBook Pro',
      price: 1299
    },
    seller: {
      username: 'Tom Wilson'
    },
    tradeMethod: 'Meet on Campus',
    location: 'Library',
    dealTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRated: false
  }
])

const favoriteProducts = ref([
  {
    id: 1,
    title: 'AirPods Pro',
    price: 199,
    views: 150,
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
])

// School options
const schools = [
  { value: 'pku', label: 'Peking University' },
  { value: 'thu', label: 'Tsinghua University' },
  { value: 'fudan', label: 'Fudan University' }
]

// Form rules
const rateRules = {
  rating: [
    { required: true, message: 'Please select a rating', trigger: 'change' }
  ],
  comment: [
    { required: true, message: 'Please enter your review', trigger: 'blur' },
    { min: 10, max: 200, message: 'Length should be 10 to 200 characters', trigger: 'blur' }
  ]
}

const editRules = {
  username: [
    { required: true, message: 'Please enter username', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20 characters', trigger: 'blur' }
  ],
  school: [
    { required: true, message: 'Please select school', trigger: 'change' }
  ]
}

// Methods
const handleEdit = (productId) => {
  if (productId) {
    router.push(`/product/${productId}/edit`)
  } else {
    editForm.value = {
      username: userInfo.value.username,
      school: userInfo.value.school,
      bio: userInfo.value.bio
    }
    editDialogVisible.value = true
  }
}

const handleOffShelf = async (id) => {
  try {
    loading.value = true
    // TODO: Call API to remove product
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('Product removed successfully')
    // Update product status
    const product = publishedProducts.value.find(p => p.id === id)
    if (product) {
      product.status = 'removed'
    }
  } catch (error) {
    console.error('Failed to remove product:', error)
    ElMessage.error('Failed to remove product')
  } finally {
    loading.value = false
  }
}

const handleOnShelf = async (id) => {
  try {
    loading.value = true
    // TODO: Call API to repost product
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('Product reposted successfully')
    // Update product status
    const product = publishedProducts.value.find(p => p.id === id)
    if (product) {
      product.status = 'active'
    }
  } catch (error) {
    console.error('Failed to repost product:', error)
    ElMessage.error('Failed to repost product')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    loading.value = true
    // TODO: Call API to delete product
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('Product deleted successfully')
    // Remove product from list
    publishedProducts.value = publishedProducts.value.filter(p => p.id !== id)
  } catch (error) {
    console.error('Failed to delete product:', error)
    ElMessage.error('Failed to delete product')
  } finally {
    loading.value = false
  }
}

const handleRate = (order) => {
  rateForm.value = {
    rating: 5,
    comment: ''
  }
  rateDialogVisible.value = true
}

const submitRate = async () => {
  if (!rateFormRef.value) return
  
  try {
    await rateFormRef.value.validate()
    loading.value = true
    
    // TODO: Call API to submit rating
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('Rating submitted successfully')
    rateDialogVisible.value = false
  } catch (error) {
    console.error('Failed to submit rating:', error)
    ElMessage.error('Failed to submit rating')
  } finally {
    loading.value = false
  }
}

const submitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    loading.value = true
    
    // TODO: Call API to update profile
    await new Promise(resolve => setTimeout(resolve, 500))
    
    ElMessage.success('Profile updated successfully')
    editDialogVisible.value = false
    
    // Update user info
    userInfo.value = {
      ...userInfo.value,
      ...editForm.value
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElMessage.error('Failed to update profile')
  } finally {
    loading.value = false
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

// Watch for route query changes
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    activeTab.value = newTab
  }
}, { immediate: true })

// Set initial tab on component mount
onMounted(() => {
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})
</script>

<style lang="scss" scoped>
.user-center {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.user-container {
  display: grid;
  gap: 24px;
}

.user-card {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  
  &.small {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

.user-info {
  flex: 1;
  
  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }
  
  p {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
}

.user-stats {
  display: flex;
  gap: 24px;
  
  .stat-item {
    cursor: pointer;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 0.8;
    }
    
    .value {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      margin-right: 4px;
    }
    
    .label {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

.main-content {
  background: var(--bg-white);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.product-item {
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
  
  .product-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    
    &.active {
      background: rgba(var(--success-color-rgb), 0.1);
      color: var(--success-color);
    }
    
    &.sold {
      background: rgba(var(--warning-color-rgb), 0.1);
      color: var(--warning-color);
    }
    
    &.removed {
      background: rgba(var(--danger-color-rgb), 0.1);
      color: var(--danger-color);
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
    }
    
    .actions {
      margin-top: 12px;
      display: flex;
      gap: 16px;
    }
  }
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.order-item {
  background: var(--bg-white);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  border: 1px solid var(--border-color);
}

.order-product {
  display: flex;
  gap: 12px;
  flex: 1;
  
  .product-cover {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    flex-shrink: 0;
  }
  
  .product-info {
    h3 {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }
    
    .price {
      font-size: 18px;
      font-weight: 600;
      color: var(--price-color);
    }
  }
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px;
  
  .buyer-info,
  .seller-info {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .username {
      font-size: 14px;
      color: var(--text-primary);
    }
  }
  
  .trade-info {
    font-size: 14px;
    color: var(--text-secondary);
    
    .method {
      margin-bottom: 4px;
    }
    
    .location {
      margin-bottom: 4px;
    }
    
    .time {
      font-size: 12px;
    }
  }
}

@media (max-width: 768px) {
  .user-center {
    padding: 20px 0;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
  }
  
  .order-item {
    flex-direction: column;
  }
  
  .order-product {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 16px;
  }
  
  .order-info {
    min-width: 0;
  }
}
</style> 