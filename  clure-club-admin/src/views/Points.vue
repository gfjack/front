<template>
  <div class="points-page">
    <div class="page-header">
      <h1 class="page-title">积分管理</h1>
      <div class="header-actions">
        <el-button type="success" icon="Plus" @click="openAddDialog">
          录入积分
        </el-button>
        <el-button type="warning" icon="Minus" @click="openDeductDialog">
          抵扣积分
        </el-button>
      </div>
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

    <!-- 积分列表 -->
    <el-card class="table-card">
      <el-table
          v-loading="loading"
          :data="pointsList"
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
            <el-tag type="primary">{{ row.effectivePoints }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalPoints" label="总积分" width="100">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.totalPoints }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastPointsDate" label="最后更新" width="120">
          <template #default="{ row }">
            {{ formatDate(row.lastPointsDate) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
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
            >
              抵扣
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 录入积分对话框 -->
    <el-dialog
        v-model="addDialogVisible"
        title="录入积分"
        width="500px"
    >
      <el-form
          ref="addFormRef"
          :model="addForm"
          :rules="addRules"
          label-width="80px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
              v-model="addForm.userId"
              placeholder="请输入用户ID"
              :disabled="!!selectedUser"
          />
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
    >
      <el-form
          ref="deductFormRef"
          :model="deductForm"
          :rules="deductRules"
          label-width="80px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
              v-model="deductForm.userId"
              placeholder="请输入用户ID"
              :disabled="!!selectedUser"
          />
        </el-form-item>
        <el-form-item label="抵扣数量" prop="points">
          <el-input-number
              v-model="deductForm.points"
              :min="1"
              :max="getMaxDeductPoints()"
              placeholder="请输入抵扣数量"
              style="width: 100%"
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
            v-if="selectedUser"
            :title="`当前有效积分：${selectedUser.effectivePoints}`"
            type="info"
            :closable="false"
            style="margin-top: 10px"
        />
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deductDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleDeductPoints">
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
import { ref, reactive, computed, onMounted } from 'vue'
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
const selectedUser = ref(null)

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
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  points: [
    { required: true, message: '请输入积分数量', trigger: 'blur' }
  ]
}

const deductRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' }
  ],
  points: [
    { required: true, message: '请输入抵扣数量', trigger: 'blur' }
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

const loadPointsList = async () => {
  try {
    loading.value = true
    const response = await getAllUserPoints()
    if (response.code === 200) {
      pointsList.value = response.data
    }
  } catch (error) {
    console.error('加载积分列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadUsers = async () => {
  try {
    const response = await getAllUsers()
    if (response.code === 200) {
      userList.value = response.data
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

const getUserName = (userId) => {
  const user = userList.value.find(u => u.id === userId)
  return user ? user.username : '未知用户'
}

const openAddDialog = (row = null) => {
  selectedUser.value = row
  addForm.userId = row ? row.userId : ''
  addForm.points = 1
  addForm.remark = ''
  addDialogVisible.value = true
}

const openDeductDialog = (row = null) => {
  selectedUser.value = row
  deductForm.userId = row ? row.userId : ''
  deductForm.points = 1
  deductForm.remark = ''
  deductDialogVisible.value = true
}

const getMaxDeductPoints = () => {
  return selectedUser.value ? selectedUser.value.effectivePoints : 10000
}

const handleAddPoints = async () => {
  try {
    await addFormRef.value.validate()
    submitLoading.value = true

    const response = await addUserPoints(addForm)
    if (response.code === 200) {
      ElMessage.success('积分录入成功')
      addDialogVisible.value = false
      loadPointsList()
    }
  } catch (error) {
    console.error('录入积分失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleDeductPoints = async () => {
  try {
    await deductFormRef.value.validate()
    submitLoading.value = true

    const response = await deductUserPoints(deductForm)
    if (response.code === 200) {
      ElMessage.success('积分抵扣成功')
      deductDialogVisible.value = false
      loadPointsList()
    }
  } catch (error) {
    console.error('抵扣积分失败:', error)
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
      historyList.value = response.data
    }
  } catch (error) {
    console.error('加载积分历史失败:', error)
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
  loadPointsList()
  loadUsers()
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

.header-actions {
  display: flex;
  gap: 10px;
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

.table-card {
  border-radius: 8px;
  overflow: hidden;
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