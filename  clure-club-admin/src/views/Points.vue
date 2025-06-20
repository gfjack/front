<template>
  <div class="points-page">
    <div class="page-header">
      <h1 class="page-title">积分管理</h1>
    </div>

    <!-- 积分统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total-icon">
              <el-icon size="30"><Medal /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalPoints }}</div>
              <div class="stat-label">总积分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon effective-icon">
              <el-icon size="30"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalEffectivePoints }}</div>
              <div class="stat-label">有效积分</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users-icon">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ activeUsers }}</div>
              <div class="stat-label">有积分用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
              v-model="searchForm.username"
              placeholder="请输入用户名"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input
              v-model="searchForm.userId"
              placeholder="请输入用户ID"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button icon="Refresh" @click="resetSearch">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 积分列表 -->
    <el-card class="table-card">
      <el-table
          v-loading="loading"
          :data="filteredPointsList"
          stripe
          style="width: 100%"
      >
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column label="用户名" width="120">
          <template #default="{ row }">
            <span>{{ getUserName(row.userId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="todayPoints" label="当日积分" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.todayPoints > 0" type="success">
              {{ row.todayPoints }}
            </el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column prop="effectivePoints" label="有效积分" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.effectivePoints || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalPoints" label="总积分" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.totalPoints || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastPointsDate" label="最后更新" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lastPointsDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                  type="primary"
                  size="small"
                  icon="View"
                  @click="viewHistory(row)"
              >
                历史
              </el-button>
              <el-button
                  type="success"
                  size="small"
                  icon="Plus"
                  @click="openAddDialog(row)"
              >
                录入
              </el-button>
              <el-button
                  type="warning"
                  size="small"
                  icon="Minus"
                  @click="openDeductDialog(row)"
                  :disabled="(row.effectivePoints || 0) <= 0"
              >
                抵扣
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 录入积分对话框 -->
    <el-dialog
        v-model="addDialogVisible"
        title="录入积分"
        width="500px"
        @closed="resetAddForm"
    >
      <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addRules"
          label-width="80px"
      >
        <el-form-item label="选择用户" prop="userId">
          <el-select
              v-model="addForm.userId"
              placeholder="请选择用户"
              filterable
              style="width: 100%"
              :disabled="!!preSelectedUser"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.username} (ID: ${user.id})`"
                :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="积分数量" prop="points">
          <el-input-number
              v-model="addForm.points"
              :min="1"
              :max="1000"
              placeholder="请输入积分数量"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="addForm.remark"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleAddPoints">
            录入
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 抵扣积分对话框 -->
    <el-dialog
        v-model="deductDialogVisible"
        title="抵扣积分"
        width="500px"
        @closed="resetDeductForm"
    >
      <el-form
          ref="deductFormRef"
          :model="deductForm"
          :rules="deductRules"
          label-width="80px"
      >
        <el-form-item label="选择用户" prop="userId">
          <el-select
              v-model="deductForm.userId"
              placeholder="请选择用户"
              filterable
              style="width: 100%"
              :disabled="!!preSelectedUser"
              @change="onDeductUserChange"
          >
            <el-option
                v-for="user in availableUsersForDeduct"
                :key="user.id"
                :label="`${user.username} (ID: ${user.id}) - 有效积分: ${getUserEffectivePoints(user.id)}`"
                :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="currentUserEffectivePoints !== null" label="当前有效积分">
          <el-tag type="info" size="large">{{ currentUserEffectivePoints }}</el-tag>
        </el-form-item>

        <el-form-item label="抵扣数量" prop="points">
          <el-input-number
              v-model="deductForm.points"
              :min="1"
              placeholder="请输入抵扣数量"
              style="width: 100%"
              :disabled="!deductForm.userId || currentUserEffectivePoints <= 0"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
              v-model="deductForm.remark"
              type="textarea"
              placeholder="请输入备注"
              :rows="3"
          />
        </el-form-item>

        <el-alert
            v-if="currentUserEffectivePoints !== null && currentUserEffectivePoints <= 0"
            title="该用户没有可抵扣的积分"
            type="warning"
            :closable="false"
        />

        <el-alert
            v-if="currentUserEffectivePoints !== null && deductForm.points > currentUserEffectivePoints"
            :title="`抵扣数量不能超过有效积分 ${currentUserEffectivePoints}`"
            type="error"
            :closable="false"
        />
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deductDialogVisible = false">取消</el-button>
          <el-button
              type="primary"
              :loading="submitLoading"
              @click="handleDeductPoints"
              :disabled="currentUserEffectivePoints <= 0 || deductForm.points > currentUserEffectivePoints"
          >
            抵扣
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 积分历史对话框 -->
    <el-dialog
        v-model="historyDialogVisible"
        title="积分历史"
        width="800px"
    >
      <el-table
          v-loading="historyLoading"
          :data="historyList"
          stripe
          max-height="400"
      >
        <el-table-column prop="pointsType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag
                :type="getPointsTypeColor(row.pointsType)"
                size="small"
            >
              {{ row.pointsTypeDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80">
          <template #default="{ row }">
            <span :class="row.points > 0 ? 'text-success' : 'text-danger'">
              {{ row.points > 0 ? '+' : '' }}{{ row.points }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="operationDate" label="操作日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.operationDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllUserPoints, addUserPoints, deductUserPoints, getUserPointsHistory } from '@/api/points'
import { getAllUsers } from '@/api/users'

const loading = ref(false)
const submitLoading = ref(false)
const historyLoading = ref(false)
const addDialogVisible = ref(false)
const deductDialogVisible = ref(false)
const historyDialogVisible = ref(false)

const addFormRef = ref()
const deductFormRef = ref()

const pointsList = ref([])
const userList = ref([])
const historyList = ref([])
const preSelectedUser = ref(null)
const currentUserEffectivePoints = ref(null)

// 搜索表单
const searchForm = reactive({
  username: '',
  userId: ''
})

const addForm = reactive({
  userId: '',
  points: 1,
  remark: ''
})

const deductForm = reactive({
  userId: '',
  points: 1,
  remark: ''
})

const addRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  points: [
    { required: true, message: '请输入积分数量', trigger: 'blur' },
    { type: 'number', min: 1, max: 1000, message: '积分数量必须在1-1000之间', trigger: 'change' }
  ]
}

const deductRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  points: [
    { required: true, message: '请输入抵扣数量', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || value < 1) {
          callback(new Error('抵扣数量必须大于0'))
          return
        }
        if (currentUserEffectivePoints.value !== null && value > currentUserEffectivePoints.value) {
          callback(new Error(`抵扣数量不能超过有效积分${currentUserEffectivePoints.value}`))
          return
        }
        callback()
      },
      trigger: ['change', 'blur']
    }
  ]
}

// 计算属性
const totalPoints = computed(() => {
  return pointsList.value.reduce((sum, item) => sum + (item.totalPoints || 0), 0)
})

const totalEffectivePoints = computed(() => {
  return pointsList.value.reduce((sum, item) => sum + (item.effectivePoints || 0), 0)
})

const activeUsers = computed(() => {
  return pointsList.value.filter(item => (item.totalPoints || 0) > 0).length
})

// 过滤后的积分列表
const filteredPointsList = computed(() => {
  let list = pointsList.value

  if (searchForm.username || searchForm.userId) {
    list = list.filter(item => {
      const user = userList.value.find(u => u.id === item.userId)
      const username = user ? user.username : ''

      const matchUsername = !searchForm.username || username.toLowerCase().includes(searchForm.username.toLowerCase())
      const matchUserId = !searchForm.userId || item.userId.toString().includes(searchForm.userId)

      return matchUsername && matchUserId
    })
  }

  return list
})

// 可以抵扣的用户列表（有效积分大于0）
const availableUsersForDeduct = computed(() => {
  return userList.value.filter(user => {
    const effectivePoints = getUserEffectivePoints(user.id)
    return effectivePoints > 0
  })
})

// 监听抵扣用户选择变化
watch(() => deductForm.userId, (newUserId) => {
  if (newUserId) {
    updateCurrentUserEffectivePoints(newUserId)
  } else {
    currentUserEffectivePoints.value = null
  }
}, { immediate: true })

const loadPointsList = async () => {
  try {
    loading.value = true
    const response = await getAllUserPoints()
    if (response.code === 200) {
      pointsList.value = response.data || []
    }
  } catch (error) {
    console.error('加载积分列表失败:', error)
    ElMessage.error('加载积分列表失败')
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await getAllUsers()
    if (response.code === 200) {
      userList.value = response.data || []
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

const handleSearch = () => {
  // 搜索通过计算属性自动完成
}

const resetSearch = () => {
  searchForm.username = ''
  searchForm.userId = ''
}

const getUserName = (userId) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? user.username : '未知用户'
}

const getUserEffectivePoints = (userId) => {
  const pointsData = pointsList.value.find(p => p.userId === userId)
  return pointsData ? (pointsData.effectivePoints || 0) : 0
}

const updateCurrentUserEffectivePoints = (userId) => {
  if (userId) {
    currentUserEffectivePoints.value = getUserEffectivePoints(userId)
    // 不自动调整抵扣数量，让用户手动输入并通过验证提示
  } else {
    currentUserEffectivePoints.value = null
  }
}

const onDeductUserChange = () => {
  // 重置抵扣数量为1
  deductForm.points = 1

  // 清除验证错误
  nextTick(() => {
    if (deductFormRef.value) {
      deductFormRef.value.clearValidate(['points'])
    }
  })
}

const openAddDialog = (row = null) => {
  preSelectedUser.value = row
  resetAddForm()

  if (row) {
    addForm.userId = row.userId
  }

  addDialogVisible.value = true
}

const openDeductDialog = (row = null) => {
  preSelectedUser.value = row
  resetDeductForm()

  if (row) {
    const effectivePoints = row.effectivePoints || 0
    if (effectivePoints <= 0) {
      ElMessage.warning('该用户没有可抵扣的积分')
      return
    }
    deductForm.userId = row.userId
    updateCurrentUserEffectivePoints(row.userId)
  }

  deductDialogVisible.value = true
}

const resetAddForm = () => {
  addForm.userId = ''
  addForm.points = 1
  addForm.remark = ''

  nextTick(() => {
    if (addFormRef.value) {
      addFormRef.value.clearValidate()
    }
  })
}

const resetDeductForm = () => {
  deductForm.userId = ''
  deductForm.points = 1
  deductForm.remark = ''
  currentUserEffectivePoints.value = null
  preSelectedUser.value = null

  nextTick(() => {
    if (deductFormRef.value) {
      deductFormRef.value.clearValidate()
    }
  })
}

const handleAddPoints = async () => {
  try {
    await addFormRef.value.validate()
    submitLoading.value = true

    const response = await addUserPoints(addForm)
    if (response.code === 200) {
      ElMessage.success('积分录入成功')
      addDialogVisible.value = false
      // 重新加载数据
      await Promise.all([loadPointsList(), loadUsers()])
    }
  } catch (error) {
    console.error('录入积分失败:', error)
    ElMessage.error('录入积分失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDeductPoints = async () => {
  try {
    await deductFormRef.value.validate()

    if (currentUserEffectivePoints.value <= 0) {
      ElMessage.warning('该用户没有可抵扣的积分')
      return
    }

    if (deductForm.points > currentUserEffectivePoints.value) {
      ElMessage.warning(`抵扣数量不能超过有效积分${currentUserEffectivePoints.value}`)
      return
    }

    submitLoading.value = true

    const response = await deductUserPoints(deductForm)
    if (response.code === 200) {
      ElMessage.success('积分抵扣成功')
      deductDialogVisible.value = false
      // 重新加载数据
      await Promise.all([loadPointsList(), loadUsers()])
    }
  } catch (error) {
    console.error('抵扣积分失败:', error)
    ElMessage.error('抵扣积分失败')
  } finally {
    submitLoading.value = false
  }
}

const viewHistory = async (row) => {
  try {
    historyLoading.value = true
    historyDialogVisible.value = true

    const response = await getUserPointsHistory(row.userId)
    if (response.code === 200) {
      historyList.value = response.data || []
    }
  } catch (error) {
    console.error('加载积分历史失败:', error)
    ElMessage.error('加载积分历史失败')
  } finally {
    historyLoading.value = false
  }
}

const getPointsTypeColor = (type) => {
  switch (type) {
    case 'EARNED': return 'success'
    case 'DEDUCTED': return 'warning'
    case 'ADMIN_ADJUSTMENT': return 'info'
    default: return 'info'
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  Promise.all([loadPointsList(), loadUsers()])
})
</script>

<style scoped>
.points-page {
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

.total-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.effective-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.users-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.search-card {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.text-success {
  color: #67c23a;
  font-weight: bold;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}
</style>