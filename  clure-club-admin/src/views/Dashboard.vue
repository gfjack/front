<template>
  <div class="dashboard">
    <h1 class="page-title">仪表板</h1>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.userCount }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon points-icon">
              <el-icon size="30"><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.totalPoints }}</div>
              <div class="stat-label">总积分数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon message-icon">
              <el-icon size="30"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.messageCount }}</div>
              <div class="stat-label">留言总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon prize-icon">
              <el-icon size="30"><Present /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.prizeCount }}</div>
              <div class="stat-label">奖品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="quick-actions">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="action-buttons">
            <el-button type="primary" icon="Plus" @click="$router.push('/users')">
              添加用户
            </el-button>
            <el-button type="success" icon="Medal" @click="$router.push('/points')">
              积分管理
            </el-button>
            <el-button type="warning" icon="Bell" @click="$router.push('/announcements')">
              发布公告
            </el-button>
            <el-button type="info" icon="Present" @click="$router.push('/prizes')">
              管理奖品
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最新留言</span>
              <el-button type="text" @click="$router.push('/messages')">查看全部</el-button>
            </div>
          </template>
          <div class="recent-messages">
            <div
                v-for="message in recentMessages"
                :key="message.id"
                class="message-item"
            >
              <div class="message-user">{{ message.username }}</div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.createTime) }}</div>
            </div>
            <div v-if="recentMessages.length === 0" class="no-data">
              暂无留言
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 积分排行榜 -->
    <el-row :gutter="20" class="ranking-section">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>积分排行榜 TOP 10</span>
              <el-button type="text" @click="$router.push('/ranking')">查看完整排行榜</el-button>
            </div>
          </template>
          <el-table :data="topRanking" stripe>
            <el-table-column prop="rank" label="排名" width="80" align="center">
              <template #default="{ row }">
                <el-tag
                    v-if="row.rank <= 3"
                    :type="getRankType(row.rank)"
                    size="small"
                >
                  {{ row.rank }}
                </el-tag>
                <span v-else>{{ row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="points" label="总积分" align="right">
              <template #default="{ row }">
                <el-tag type="success">{{ row.points }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllUsers } from '@/api/users'
import { getAllUserPoints } from '@/api/points'
import { getAllMessages } from '@/api/messages'
import { getAllPrizes } from '@/api/prizes'
import { getTotalRanking } from '@/api/ranking'

const stats = ref({
  userCount: 0,
  totalPoints: 0,
  messageCount: 0,
  prizeCount: 0
})

const recentMessages = ref([])
const topRanking = ref([])

const loadStats = async () => {
  try {
    // 加载用户统计
    const usersRes = await getAllUsers()
    if (usersRes.code === 200) {
      stats.value.userCount = usersRes.data.length
    }

    // 加载积分统计
    const pointsRes = await getAllUserPoints()
    if (pointsRes.code === 200) {
      stats.value.totalPoints = pointsRes.data.reduce((sum, item) => sum + (item.totalPoints || 0), 0)
    }

    // 加载留言统计
    const messagesRes = await getAllMessages()
    if (messagesRes.code === 200) {
      stats.value.messageCount = messagesRes.data.length
      // 获取最新的5条留言
      recentMessages.value = messagesRes.data.slice(0, 5)
    }

    // 加载奖品统计
    const prizesRes = await getAllPrizes()
    if (prizesRes.code === 200) {
      stats.value.prizeCount = prizesRes.data.length
    }

    // 加载排行榜
    const rankingRes = await getTotalRanking()
    if (rankingRes.code === 200) {
      topRanking.value = rankingRes.data.slice(0, 10)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

const getRankType = (rank) => {
  switch (rank) {
    case 1: return 'danger'
    case 2: return 'warning'
    case 3: return 'success'
    default: return 'info'
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  overflow: hidden;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.points-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.prize-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.quick-actions {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.recent-messages {
  max-height: 300px;
  overflow-y: auto;
}

.message-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}

.message-user {
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.message-content {
  color: #606266;
  line-height: 1.4;
  margin-bottom: 5px;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.no-data {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.ranking-section {
  margin-bottom: 20px;
}
</style>