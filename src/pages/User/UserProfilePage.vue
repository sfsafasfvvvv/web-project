<template>
  <div class="user-profile">
    <div class="container">
      <!-- 用户信息卡片 -->
      <div class="profile-header">
        <div class="user-card">
          <div class="user-info">
            <!-- TODO: 待添加用户头像，当前使用纯色背景 -->
            <div class="user-avatar" :style="{ background: '#f5f5f5' }">
              {{ userInfo.username?.[0]?.toUpperCase() }}
            </div>
            <div class="user-meta">
              <h1 class="username">{{ userInfo.username }}</h1>
              <p class="bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="value">{{ userInfo.creditScore }}</span>
                  <span class="label">信用分</span>
                </div>
                <router-link 
                  :to="{ name: 'user-following', params: { id: userInfo.id }}" 
                  class="stat-item"
                >
                  <span class="value">{{ userInfo.followingCount }}</span>
                  <span class="label">关注</span>
                </router-link>
                <router-link 
                  :to="{ name: 'user-followers', params: { id: userInfo.id }}" 
                  class="stat-item"
                >
                  <span class="value">{{ userInfo.followerCount }}</span>
                  <span class="label">粉丝</span>
                </router-link>
              </div>
            </div>
          </div>
          <div class="user-actions">
            <el-button
              v-if="!isCurrentUser"
              :type="isFollowing ? 'default' : 'primary'"
              @click="handleFollow"
            >
              {{ isFollowing ? '取消关注' : '关注' }}
            </el-button>
            <el-button
              v-if="!isCurrentUser"
              type="primary"
              @click="handleMessage"
            >
              发消息
            </el-button>
          </div>
        </div>
      </div>

      <!-- 用户内容区 -->
      <div class="profile-content">
        <el-tabs v-model="activeTab" class="profile-tabs">
          <!-- 在售商品 -->
          <el-tab-pane label="在售商品" name="selling">
            <div class="product-grid" v-if="sellingProducts.length">
              <div
                v-for="product in sellingProducts"
                :key="product.id"
                class="product-card"
                @click="$router.push(`/product/${product.id}`)"
              >
                <!-- TODO: 待添加商品图片，当前使用纯色背景 -->
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
                  <div class="price">¥{{ product.price }}</div>
                  <div class="meta">
                    <span class="time">{{ formatTime(product.createTime) }}</span>
                    <span class="views">{{ product.views }}次浏览</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无在售商品" />
          </el-tab-pane>

          <!-- 历史出售 -->
          <el-tab-pane label="历史出售" name="sold">
            <div class="product-grid" v-if="soldProducts.length">
              <div
                v-for="product in soldProducts"
                :key="product.id"
                class="product-card"
                @click="$router.push(`/product/${product.id}`)"
              >
                <!-- TODO: 待添加商品图片，当前使用纯色背景 -->
                <div class="product-cover" :style="{ background: '#f5f5f5' }">
                  <div class="product-status">已售出</div>
                </div>
                <div class="product-info">
                  <h3 class="title">{{ product.title }}</h3>
                  <div class="price">¥{{ product.price }}</div>
                  <div class="meta">
                    <span class="time">{{ formatTime(product.soldTime) }}</span>
                    <span class="buyer">
                      买家：
                      <router-link 
                        :to="{ name: 'user-profile', params: { id: product.buyer.id }}"
                        class="link"
                      >
                        {{ product.buyer.username }}
                      </router-link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无历史出售" />
          </el-tab-pane>

          <!-- 用户评价 -->
          <el-tab-pane label="用户评价" name="reviews">
            <div class="review-list" v-if="reviews.length">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <div class="reviewer-info">
                    <!-- TODO: 待添加评价者头像，当前使用纯色背景 -->
                    <div class="user-avatar small" :style="{ background: '#f5f5f5' }">
                      {{ review.reviewer.username?.[0]?.toUpperCase() }}
                    </div>
                    <router-link 
                      :to="{ name: 'user-profile', params: { id: review.reviewer.id }}"
                      class="username"
                    >
                      {{ review.reviewer.username }}
                    </router-link>
                  </div>
                  <div class="review-meta">
                    <el-rate
                      v-model="review.rating"
                      disabled
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                    />
                    <span class="time">{{ formatTime(review.createTime) }}</span>
                  </div>
                </div>
                <div class="review-content">
                  <p class="comment">{{ review.comment }}</p>
                  <router-link 
                    :to="{ name: 'product-detail', params: { id: review.product.id }}"
                    class="product-link"
                  >
                    <span class="label">交易商品：</span>
                    {{ review.product.title }}
                  </router-link>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无用户评价" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 举报对话框 -->
    <el-dialog
      v-model="reportDialogVisible"
      title="举报用户"
      width="500px"
    >
      <el-form
        ref="reportFormRef"
        :model="reportForm"
        :rules="reportRules"
        label-width="80px"
      >
        <el-form-item label="举报原因" prop="reason">
          <el-select v-model="reportForm.reason" placeholder="请选择举报原因">
            <el-option
              v-for="item in reportReasons"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="详细说明" prop="description">
          <el-input
            v-model="reportForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述问题..."
          />
        </el-form-item>

        <el-form-item label="图片凭证" prop="images">
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
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitReport">
            提交举报
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = ref({
  id: route.params.id,
  username: '示例用户',
  bio: '这是一个示例简介',
  creditScore: 98,
  followingCount: 56,
  followerCount: 128,
  isFollowing: false
})

// 是否为当前用户
const isCurrentUser = computed(() => {
  return userStore.user?.id === userInfo.value.id
})

// 是否已关注
const isFollowing = ref(false)

// 当前标签页
const activeTab = ref('selling')

// 在售商品
const sellingProducts = ref([
  {
    id: 1,
    title: 'iPhone 12 128G',
    price: 3999,
    createTime: new Date(Date.now() - 1000 * 60 * 30),
    views: 128,
    tags: ['95新', '保修中']
  },
  {
    id: 2,
    title: '数据结构与算法分析',
    price: 20,
    createTime: new Date(Date.now() - 1000 * 60 * 60),
    views: 56,
    tags: ['二手书籍']
  }
])

// 已售商品
const soldProducts = ref([
  {
    id: 3,
    title: 'AirPods Pro',
    price: 999,
    soldTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    buyer: {
      id: 2,
      username: '买家A'
    }
  }
])

// 用���评价
const reviews = ref([
  {
    id: 1,
    reviewer: {
      id: 2,
      username: '买家A'
    },
    rating: 5,
    comment: '很好的卖家，商品描述准确，发货速度快，包装也很好，推荐购买！',
    createTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    product: {
      id: 3,
      title: 'AirPods Pro'
    }
  }
])

// 举报相关
const reportDialogVisible = ref(false)
const reportForm = ref({
  reason: '',
  description: '',
  images: []
})
const reportRules = {
  reason: [
    { required: true, message: '请选择举报原因', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入详细说明', trigger: 'blur' },
    { min: 10, max: 500, message: '详细说明长度在10-500个字符之间', trigger: 'blur' }
  ]
}
const reportReasons = [
  { value: 'fake', label: '虚假信息' },
  { value: 'harassment', label: '骚扰行为' },
  { value: 'scam', label: '诈骗行为' },
  { value: 'inappropriate', label: '不当行为' },
  { value: 'other', label: '其他原因' }
]

// 处理关注
const handleFollow = async () => {
  try {
    // TODO: 调用关注API
    await new Promise(resolve => setTimeout(resolve, 1000))
    isFollowing.value = !isFollowing.value
    ElMessage.success(isFollowing.value ? '关注成功' : '已取消关注')
  } catch (error) {
    console.error('Follow failed:', error)
  }
}

// 处理发消息
const handleMessage = () => {
  router.push({
    name: 'message',
    query: { userId: userInfo.value.id }
  })
}

// 处理举报
const handleReport = () => {
  reportDialogVisible.value = true
}

const handleSubmitReport = async () => {
  try {
    await reportFormRef.value.validate()
    // TODO: 调用举报API
    await new Promise(resolve => setTimeout(resolve, 1000))
    reportDialogVisible.value = false
    reportForm.value = {
      reason: '',
      description: '',
      images: []
    }
    ElMessage.success('举报已提交')
  } catch (error) {
    console.error('Submit report failed:', error)
  }
}

// 格式化时间
const formatTime = (time) => {
  return formatDistanceToNow(new Date(time), {
    addSuffix: true,
    locale: zhCN
  })
}

onMounted(() => {
  // TODO: 加载用户信息和相关数据
})
</script>

<style lang="scss" scoped>
.user-profile {
  padding: 40px 0;
}

.profile-header {
  margin-bottom: 32px;
}

.user-card {
  background: white;
  padding: 32px;
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-info {
  display: flex;
  gap: 24px;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: var(--text-secondary);

  &.small {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

.user-meta {
  .username {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .bio {
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
}

.user-stats {
  display: flex;
  gap: 24px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: inherit;

    .value {
      font-size: 20px;
      font-weight: bold;
      color: var(--text-primary);
    }

    .label {
      font-size: 14px;
      color: var(--text-secondary);
    }

    &:hover {
      .value {
        color: var(--primary-color);
      }
    }
  }
}

.profile-content {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.product-card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid var(--border-color);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
  }
}

.product-cover {
  position: relative;
  padding-top: 100%;
  border-radius: var(--radius-lg);
  background-size: cover;
  background-position: center;
}

.product-tags {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;

  .tag {
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 12px;
    color: white;
    background: var(--primary-color);
  }
}

.product-status {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
}

.product-info {
  padding: 16px;

  .title {
    font-size: 16px;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .price {
    font-size: 20px;
    font-weight: bold;
    color: var(--danger-color);
    margin-bottom: 8px;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--text-secondary);

    .link {
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: var(--radius-lg);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .reviewer-info {
    display: flex;
    align-items: center;
    gap: 8px;

    .username {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 500;

      &:hover {
        color: var(--primary-color);
      }
    }
  }

  .review-meta {
    display: flex;
    align-items: center;
    gap: 12px;

    .time {
      color: var(--text-secondary);
      font-size: 12px;
    }
  }
}

.review-content {
  .comment {
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .product-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 14px;

    .label {
      color: var(--text-secondary);
    }

    &:hover {
      color: var(--primary-color);
    }
  }
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

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    gap: 24px;
  }

  .user-actions {
    width: 100%;
    display: flex;
    gap: 12px;

    .el-button {
      flex: 1;
    }
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .user-stats {
    justify-content: center;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style> 