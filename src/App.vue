<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <el-container>
        <el-header height="60px">
          <TheHeader />
        </el-header>
        
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
        
        <el-footer height="auto">
          <TheFooter />
        </el-footer>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import TheHeader from '@/components/Header/TheHeader.vue'
import TheFooter from '@/components/Footer/TheFooter.vue'
</script>

<style lang="scss">
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}

.el-main {
  padding: 20px;
  background: #f5f7fa;
}

.el-footer {
  padding: 0;
  background: #fff;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 