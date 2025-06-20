<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <el-aside
        :width="isCollapse ? '64px' : '250px'"
        class="sidebar"
    >
      <div class="logo-container" :class="{ collapsed: isCollapse }">
        <div class="logo-content">
          <img
              v-if="!isCollapse"
              :src="logoImage"
              alt="雷霆路亚"
              class="logo-image"
          />
          <img
              v-else
              :src="logoImage"
              alt="雷霆路亚"
              class="logo-icon"
          />
        </div>
      </div>

      <el-menu
          :default-active="currentRoute"
          :collapse="isCollapse"
          router
          class="sidebar-menu"
          background-color="#2c3e50"
          text-color="#ecf0f1"
          active-text-color="#409EFF"
      >
        <el-menu-item
            v-for="route in menuRoutes"
            :key="route.path"
            :index="route.path"
        >
          <el-icon>
            <component :is="route.meta.icon" />
          </el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
              type="text"
              size="large"
              @click="toggleSidebar"
          >
            <el-icon size="20">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </el-button>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="admin-info">
              <el-avatar size="small" :icon="UserFilled" />
              <span class="admin-name">{{ adminInfo?.username || '管理员' }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import logoImage from '@/assets/logo-thunder-lure-2.svg'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)

const currentRoute = computed(() => route.path)
const adminInfo = computed(() => authStore.adminInfo)

// 菜单路由
const menuRoutes = [
  { path: '/dashboard', meta: { title: '仪表板', icon: 'Odometer' } },
  { path: '/users', meta: { title: '用户管理', icon: 'User' } },
  { path: '/points', meta: { title: '积分管理', icon: 'Medal' } },
  { path: '/announcements', meta: { title: '公告管理', icon: 'Bell' } },
  { path: '/prizes', meta: { title: '奖品管理', icon: 'Present' } },
  { path: '/messages', meta: { title: '留言管理', icon: 'ChatDotRound' } },
  { path: '/ranking', meta: { title: '排行榜', icon: 'TrophyBase' } }
]

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能待开发')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
        '确定要退出登录吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    authStore.logout()
    ElMessage.success('退出成功')
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  // 如果没有管理员信息，尝试获取
  if (!adminInfo.value) {
    authStore.fetchCurrentAdmin()
  }
})
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  background-color: #2c3e50;
  transition: width 0.3s;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 110px;
  padding: 20px;
  background-color: #2c3e50;
  transition: all 0.3s;
}

.logo-container.collapsed {
  padding: 15px;
  justify-content: center;
  height: 70px;
}

.logo-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
}

.logo-image {
  height: 80px;
  width: auto;
  max-width: 220px;
}

.logo-icon {
  height: 50px;
  width: 50px;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 110px);
}

.main-container {
  flex: 1;
  background-color: #f5f7fa;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.admin-info:hover {
  background-color: #f5f7fa;
}

.admin-name {
  margin: 0 8px;
  color: #303133;
  font-size: 14px;
}

.main-content {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}
</style>