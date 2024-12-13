<template>
  <div class="followers-page">
    <div class="container">
      <div class="page-header">
        <h1 class="title">粉丝列表</h1>
        <div class="meta">
          共 <span class="count">{{ followersList.length }}</span> 个粉丝
        </div>
      </div>

      <div class="user-list" v-if="followersList.length">
        <div v-for="user in followersList" :key="user.id" class="user-card">
          <div class="user-info">
            <!-- TODO: 待添加用户头像，当前使用纯色背景 -->
            <div class="user-avatar" :style="{ background: '#f5f5f5' }">
              {{ user.username?.[0]?.toUpperCase() }}
            </div>
            <div class="user-meta">
              <router-link 
                :to="{ name: 'user-profile', params: { id: user.id }}"
                class="username"
              >
                {{ user.username }}
              </router-link>
              <p class="bio">{{ user.bio || '这个人很懒，什么都没写~' }}</p>
              <div class="user-stats">
                <div class="stat-item">
                  <span class="value">{{ user.creditScore }}</span>
                  <span class="label">信用分</span>
                </div>
                <div class="stat-item">
                  <span class="value">{{ user.productCount }}</span>
                  <span class="label">在售</span>
                </div>
                <div class="stat-item">
                  <span class="value">{{ user.followerCount }}</span>
                  <span class="label">粉丝</span>
                </div>
              </div>
            </div>
          </div>
          <div class="user-actions">
            <el-button
              :type="user.isFollowing ? 'default' : 'primary'"
              @click="handleFollow(user)"
            >
              {{ user.isFollowing ? '取消关注' : '关注' }}
            </el-button>
            <el-button
              type="primary"
              @click="handleMessage(user)"
            >
              发消息
            </el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无粉丝" />

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <el-button
          :loading="loading"
          @click="loadMore"
        >
          加载更多
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 粉丝列表
const followersList = ref([
  {
    id: 1,
    username: '示例粉丝A',
    bio: '这是一个示例简介',
    creditScore: 92,
    productCount: 5,
    followerCount: 45,
    isFollowing: false
  },
  {
    id: 2,
    username: '示例粉丝B',
    bio: '喜欢淘二手好物',
    creditScore: 95,
    productCount: 3,
    followerCount: 23,
    isFollowing: true
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const hasMore = ref(true)
const loading = ref(false)

// 处理关注/取消关注
const handleFollow = async (user) => {
  try {
    // TODO: 调用关注/取消关注API
    await new Promise(resolve => setTimeout(resolve, 1000))
    user.isFollowing = !user.isFollowing
    ElMessage.success(user.isFollowing ? '关注成功' : '已取消关注')
  } catch (error) {
    console.error('Follow failed:', error)
  }
}

// 处理发消息
const handleMessage = (user) => {
  router.push({
    name: 'message',
    query: { userId: user.id }
  })
}

// 加载更多
const loadMore = async () => {
  if (loading.value) return
  loading.value = true
  try {
    // TODO: 调用获取粉丝列表API
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 模拟加载更多数据
    const moreUsers = [
      {
        id: 3,
        username: '示例粉丝C',
        bio: '爱好收藏各类二手书籍',
        creditScore: 94,
        productCount: 7,
        followerCount: 34,
        isFollowing: false
      }
    ]
    followersList.value.push(...moreUsers)
    currentPage.value++
    // 判断是否还有更多数据
    hasMore.value = currentPage.value * pageSize.value < total.value
  } catch (error) {
    console.error('Load more failed:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // TODO: 加载初始数据
})
</script>

<style lang="scss" scoped>
.followers-page {
  padding: 40px 0;
}

.page-header {
  margin-bottom: 32px;

  .title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .meta {
    color: var(--text-secondary);

    .count {
      color: var(--primary-color);
      font-weight: bold;
    }
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.user-card {
  background: white;
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
}

.user-info {
  display: flex;
  gap: 16px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-secondary);
}

.user-meta {
  .username {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
    text-decoration: none;
    margin-bottom: 4px;
    display: inline-block;

    &:hover {
      color: var(--primary-color);
    }
  }

  .bio {
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 8px;
  }
}

.user-stats {
  display: flex;
  gap: 16px;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .value {
      font-size: 16px;
      font-weight: bold;
      color: var(--text-primary);
    }

    .label {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }
}

.user-actions {
  display: flex;
  gap: 12px;
}

.load-more {
  margin-top: 32px;
  text-align: center;
}

@media (max-width: 768px) {
  .user-card {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .user-actions {
    width: 100%;

    .el-button {
      flex: 1;
    }
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
}
</style> 