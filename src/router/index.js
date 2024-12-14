import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home/HomePage.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Auth/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/pages/Auth/RegisterPage.vue')
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/pages/Product/ProductDetailPage.vue')
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/pages/Product/PublishPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/pages/User/UserCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/message',
      name: 'message',
      component: () => import('@/pages/Message/MessageCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('@/pages/Category/CategoryPage.vue')
    },
    {
      path: '/category/:category',
      name: 'category-detail',
      component: () => import('@/pages/Category/CategoryDetailPage.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/Search/SearchResultPage.vue')
    },
    {
      path: '/user/:id',
      name: 'user-profile',
      component: () => import('@/pages/User/UserProfilePage.vue')
    },
    {
      path: '/user/:id/following',
      name: 'user-following',
      component: () => import('@/pages/User/UserFollowingPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:id/followers',
      name: 'user-followers',
      component: () => import('@/pages/User/UserFollowersPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/news',
      name: 'news-list',
      component: () => import('@/pages/News/NewsListPage.vue')
    },
    {
      path: '/news/:id',
      name: 'news-detail',
      component: () => import('@/pages/News/NewsDetailPage.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router 