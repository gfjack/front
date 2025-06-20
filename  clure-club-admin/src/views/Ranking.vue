<template>
  <div class="ranking-page">
    <div class="page-header">
      <h1 class="page-title">积分排行榜</h1>
      <el-button-group>
        <el-button
            :type="activeTab === 'daily' ? 'primary' : 'default'"
            @click="switchTab('daily')"
        >
          当日排行
        </el-button>
        <el-button
            :type="activeTab === 'weekly' ? 'primary' : 'default'"
            @click="switchTab('weekly')"
        >
          本周排行
        </el-button>
        <el-button
            :type="activeTab === 'total' ? 'primary' : 'default'"
            @click="switchTab('total')"
        >
          总排行榜
        </el-button>
      </el-button-group>
    </div>

    <!-- 排行榜卡片 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <div class="header-info">
                <el-icon size="20" color="#409EFF">
                  <TrophyBase />
                </el-icon>
                <span class="header-title">{{ getTabTitle() }}</span>
              </div>
              <div class="header-stats">
                <el-tag type="info">共 {{ currentRanking.length }} 名用户</el-tag>
                <el-button
                    type="primary"
                    size="small"
                    icon="Refresh"
                    @click="loadRanking"
                    :loading="loading"
                >
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <!-- 前三名展示 -->
          <div v-if="topThree.length > 0" class="top-three">
            <div
                v-for="(user, index) in topThree"
                :key="user.userId"
                :class="['podium-item', `rank-${index + 1}`]"
            >
              <div class="podium-rank">
                <div class="rank-circle">
                  <el-icon size="24">
                    <component :is="getRankIcon(index + 1)" />
                  </el-icon>
                </div>
                <div class="rank-number">{{ index + 1 }}</div>
              </div>
              <div class="user-info">
                <div class="username">{{ user.username }}</div>
                <div class="points">{{ user.points }} 积分</div>
              </div>
            </div>
          </div>

          <!-- 完整排行榜表格 -->
          <el-table
              v-loading="loading"
              :data="currentRanking"
              stripe
              style="width: 100%; margin-top: 20px;"
              :row-class-name="getRankRowClass"
          >
            <el-table-column prop="rank" label="排名" width="80" align="center">
              <template #default="{ row }">
                <div class="rank-badge">
                  <el-tag
                      v-if="row.rank <= 3"
                      :type="getRankTagType(row.rank)"
                      size="large"
                      effect="dark"
                  >
                    <el-icon><component :is="getRankIcon(row.rank)" /></el-icon>
                    {{ row.rank }}
                  </el-tag>
                  <span v-else class="normal-rank">{{ row.rank }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="username" label="用户名" min-width="150">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :size="32" style="margin-right: 10px;">
                    {{ row.username.charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span class="username-text">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="points" label="积分" width="120" align="right">
              <template #default="{ row }">
                <div class="points-cell">
                  <el-tag
                      :type="getPointsTagType(row.rank)"
                      size="large"
                      effect="plain"
                  >
                    {{ row.points }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="进步情况" width="120" align="center">
              <template #default="{ row }">
                <div class="progress-indicator">
                  <el-icon
                      v-if="getProgressType(row.rank) === 'up'"
                      color="#67c23a"
                      size="16"
                  >
                    <ArrowUp />
                  </el-icon>
                  <el-icon
                      v-else-if="getProgressType(row.rank) === 'down'"
                      color="#f56c6c"
                      size="16"
                  >
                    <ArrowDown />
                  </el-icon>
                  <el-icon
                      v-else
                      color="#909399"
                      size="16"
                  >
                    <Minus />
                  </el-icon>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <div v-if="!loading && currentRanking.length === 0" class="empty-state">
            <el-empty description="暂无排行榜数据">
              <el-button type="primary" @click="loadRanking">刷新数据</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getDailyRanking, getWeeklyRanking, getTotalRanking } from '@/api/ranking'

const loading = ref(false)
const activeTab = ref('total')

const dailyRanking = ref([])
const weeklyRanking = ref([])
const totalRanking = ref([])

// 当前显示的排行榜
const currentRanking = computed(() => {
  switch (activeTab.value) {
    case 'daily': return dailyRanking.value
    case 'weekly': return weeklyRanking.value
    case 'total': return totalRanking.value
    default: return []
  }
})

// 前三名
const topThree = computed(() => {
  return currentRanking.value.slice(0, 3)
})

const switchTab = (tab) => {
  activeTab.value = tab
  loadRanking()
}

const loadRanking = async () => {
  try {
    loading.value = true

    let response
    switch (activeTab.value) {
      case 'daily':
        response = await getDailyRanking()
        if (response.code === 200) {
          dailyRanking.value = response.data
        }
        break
      case 'weekly':
        response = await getWeeklyRanking()
        if (response.code === 200) {
          weeklyRanking.value = response.data
        }
        break
      case 'total':
        response = await getTotalRanking()
        if (response.code === 200) {
          totalRanking.value = response.data
        }
        break
    }
  } catch (error) {
    console.error('加载排行榜失败:', error)
    ElMessage.error('加载排行榜失败')
  } finally {
    loading.value = false
  }
}

const getTabTitle = () => {
  switch (activeTab.value) {
    case 'daily': return '当日积分排行榜'
    case 'weekly': return '本周积分排行榜'
    case 'total': return '总积分排行榜'
    default: return '排行榜'
  }
}

const getRankIcon = (rank) => {
  switch (rank) {
    case 1: return 'Medal'
    case 2: return 'Star'
    case 3: return 'Trophy'
    default: return 'CircleCheck'
  }
}

const getRankTagType = (rank) => {
  switch (rank) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'success'
    default: return 'info'
  }
}

const getPointsTagType = (rank) => {
  if (rank <= 3) return 'success'
  if (rank <= 10) return 'primary'
  return 'info'
}

const getRankRowClass = ({ row }) => {
  if (row.rank === 1) return 'rank-first'
  if (row.rank === 2) return 'rank-second'
  if (row.rank === 3) return 'rank-third'
  if (row.rank <= 10) return 'rank-top10'
  return ''
}

const getProgressType = (rank) => {
  // 这里可以根据历史排名数据来判断进步情况
  // 目前返回随机状态作为演示
  const random = Math.random()
  if (random > 0.6) return 'up'
  if (random < 0.3) return 'down'
  return 'same'
}

onMounted(() => {
  loadRanking()
})
</script>

<style scoped>
.ranking-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.ranking-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-three {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding: 20px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 8px;
  margin-bottom: 20px;
}

.podium-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  transition: transform 0.3s;
}

.podium-item:hover {
  transform: translateY(-5px);
}

.rank-1 {
  border-top: 3px solid #f56c6c;
}

.rank-2 {
  border-top: 3px solid #e6a23c;
}

.rank-3 {
  border-top: 3px solid #67c23a;
}

.podium-rank {
  margin-bottom: 10px;
}

.rank-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 0 auto 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.rank-1 .rank-circle {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.rank-2 .rank-circle {
  background: linear-gradient(135deg, #e6a23c, #eebe77);
}

.rank-3 .rank-circle {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.rank-number {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.user-info .username {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.user-info .points {
  font-size: 14px;
  color: #409EFF;
  font-weight: 500;
}

.rank-badge {
  display: flex;
  justify-content: center;
}

.normal-rank {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.user-cell {
  display: flex;
  align-items: center;
}

.username-text {
  font-weight: 500;
  color: #303133;
}

.points-cell {
  text-align: right;
}

.progress-indicator {
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

/* 排名行样式 */
:deep(.rank-first) {
  background-color: #fef0f0 !important;
}

:deep(.rank-second) {
  background-color: #fdf6ec !important;
}

:deep(.rank-third) {
  background-color: #f0f9ff !important;
}

:deep(.rank-top10) {
  background-color: #fafafa !important;
}
</style>