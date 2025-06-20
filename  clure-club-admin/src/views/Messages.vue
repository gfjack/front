<template>
  <div class="messages-page">
    <div class="page-header">
      <h1 class="page-title">留言管理</h1>
      <div class="header-stats">
        <el-tag type="info">总留言：{{ messageList.length }}</el-tag>
        <el-tag type="warning">待处理：{{ pendingCount }}</el-tag>
      </div>
    </div>

    <!-- 留言列表 -->
    <el-card class="table-card">
      <el-table
          v-loading="loading"
          :data="messageList"
          stripe
          style="width: 100%"
          :row-class-name="getRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="content" label="留言内容" min-width="300">
          <template #default="{ row }">
            <div class="message-content">
              {{ row.content }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusDesc(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="回复" width="150">
          <template #default="{ row }">
            <div v-if="row.replies && row.replies.length > 0" class="replies-info">
              <el-tag type="success" size="small">
                已回复 ({{ row.replies.length }})
              </el-tag>
            </div>
            <span v-else class="no-reply">未回复</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="留言时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button
                type="info"
                size="small"
                icon="View"
                @click="openDetailDialog(row)"
            >
              详情
            </el-button>
            <el-button
                type="primary"
                size="small"
                icon="ChatDotRound"
                @click="openReplyDialog(row)"
            >
              回复
            </el-button>
            <el-dropdown @command="(command) => handleVisibilityCommand(command, row)">
              <el-button type="info" size="small" icon="More">
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-if="row.status !== 'PUBLISHED'"
                      command="publish"
                  >
                    设为公开
                  </el-dropdown-item>
                  <el-dropdown-item
                      v-if="row.status !== 'HIDDEN'"
                      command="hide"
                  >
                    设为隐藏
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 留言详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="留言详情"
        width="800px"
        :close-on-click-modal="false"
    >
      <div v-if="currentDetailMessage" class="message-detail-view">
        <!-- 留言信息 -->
        <div class="message-main-info">
          <h3>留言信息</h3>
          <div class="info-row">
            <span class="label">用户名：</span>
            <span class="value">{{ currentDetailMessage.username }}</span>
          </div>
          <div class="info-row">
            <span class="label">留言时间：</span>
            <span class="value">{{ formatTime(currentDetailMessage.createTime) }}</span>
          </div>
          <div class="info-row">
            <span class="label">状态：</span>
            <el-tag :type="getStatusType(currentDetailMessage.status)" size="small">
              {{ getStatusDesc(currentDetailMessage.status) }}
            </el-tag>
          </div>
          <div class="info-row">
            <span class="label">留言内容：</span>
          </div>
          <div class="message-content-full">
            {{ currentDetailMessage.content }}
          </div>
        </div>

        <!-- 回复列表 -->
        <div v-if="currentDetailMessage.replies && currentDetailMessage.replies.length > 0" class="replies-section">
          <h3>回复记录 ({{ currentDetailMessage.replies.length }}条)</h3>
          <div class="replies-list">
            <div
                v-for="(reply, index) in currentDetailMessage.replies"
                :key="reply.id"
                class="reply-detail-item"
            >
              <div class="reply-header">
                <span class="reply-index">#{{ index + 1 }}</span>
                <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                <el-tag :type="reply.isVisible ? 'success' : 'warning'" size="small">
                  {{ reply.isVisible ? '公开' : '私密' }}
                </el-tag>
              </div>
              <div class="reply-content-full">
                {{ reply.content }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-replies">
          <el-empty description="暂无回复" :image-size="100" />
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="openReplyFromDetail">
            回复留言
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
        v-model="replyDialogVisible"
        title="回复留言"
        width="700px"
        :close-on-click-modal="false"
    >
      <div v-if="currentMessage" class="message-detail">
        <div class="original-message">
          <h4>原留言内容：</h4>
          <div class="message-info">
            <span class="user-name">{{ currentMessage.username }}</span>
            <span class="message-time">{{ formatTime(currentMessage.createTime) }}</span>
          </div>
          <div class="message-text">{{ currentMessage.content }}</div>
        </div>

        <!-- 已有回复 -->
        <div v-if="currentMessage.replies && currentMessage.replies.length > 0" class="existing-replies">
          <h4>已有回复：</h4>
          <div
              v-for="reply in currentMessage.replies"
              :key="reply.id"
              class="reply-item"
          >
            <div class="reply-meta">
              <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
              <el-tag :type="reply.isVisible ? 'success' : 'warning'" size="small">
                {{ reply.isVisible ? '公开' : '私密' }}
              </el-tag>
            </div>
            <div class="reply-content">{{ reply.content }}</div>
          </div>
        </div>
      </div>

      <el-form
          ref="replyFormRef"
          :model="replyForm"
          :rules="replyRules"
          label-width="80px"
      >
        <el-form-item label="回复内容" prop="content">
          <el-input
              v-model="replyForm.content"
              type="textarea"
              placeholder="请输入回复内容"
              :rows="4"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="是否公开">
          <el-switch
              v-model="replyForm.isVisible"
              active-text="公开可见"
              inactive-text="私密回复"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleReply">
            发送回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllMessages, replyMessage, setMessageVisibility } from '@/api/messages'

const loading = ref(false)
const submitLoading = ref(false)
const replyDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const replyFormRef = ref()

const messageList = ref([])
const currentMessage = ref(null)
const currentDetailMessage = ref(null)

const replyForm = reactive({
  content: '',
  isVisible: true
})

const replyRules = {
  content: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { max: 500, message: '回复内容不能超过500个字符', trigger: 'blur' }
  ]
}

// 计算待处理留言数量
const pendingCount = computed(() => {
  return messageList.value.filter(msg => msg.status === 'PENDING').length
})

const loadMessages = async () => {
  try {
    loading.value = true
    const response = await getAllMessages()
    if (response.code === 200) {
      messageList.value = response.data || []
    }
  } catch (error) {
    console.error('加载留言列表失败:', error)
    ElMessage.error('加载留言列表失败')
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'PUBLISHED': return 'success'
    case 'REPLIED': return 'primary'
    case 'HIDDEN': return 'danger'
    default: return 'info'
  }
}

const getStatusDesc = (status) => {
  switch (status) {
    case 'PENDING': return '待处理'
    case 'PUBLISHED': return '已发布'
    case 'REPLIED': return '已回复'
    case 'HIDDEN': return '已隐藏'
    default: return status
  }
}

const getRowClassName = ({ row }) => {
  if (row.status === 'PENDING') {
    return 'pending-row'
  }
  return ''
}

const openDetailDialog = (row) => {
  currentDetailMessage.value = row
  detailDialogVisible.value = true
}

const openReplyFromDetail = () => {
  detailDialogVisible.value = false
  openReplyDialog(currentDetailMessage.value)
}

const openReplyDialog = (row) => {
  currentMessage.value = row
  replyForm.content = ''
  replyForm.isVisible = true
  replyDialogVisible.value = true
}

const handleReply = async () => {
  try {
    await replyFormRef.value.validate()
    submitLoading.value = true

    const response = await replyMessage(currentMessage.value.id, replyForm)
    if (response.code === 200) {
      ElMessage.success('回复发送成功')
      replyDialogVisible.value = false
      loadMessages()
    }
  } catch (error) {
    console.error('发送回复失败:', error)
    ElMessage.error('发送回复失败')
  } finally {
    submitLoading.value = false
  }
}

const handleVisibilityCommand = async (command, row) => {
  try {
    let isVisible = command === 'publish'
    let actionText = isVisible ? '公开' : '隐藏'

    await ElMessageBox.confirm(
        `确定要将此留言设为${actionText}吗？`,
        '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await setMessageVisibility(row.id, isVisible)
    if (response.code === 200) {
      ElMessage.success(`留言已设为${actionText}`)
      loadMessages()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('设置留言可见性失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.messages-page {
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

.header-stats {
  display: flex;
  gap: 10px;
}

.table-card {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.pending-row) {
  background-color: #fdf6ec !important;
}

.message-content {
  line-height: 1.4;
  color: #303133;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.replies-info {
  text-align: center;
}

.no-reply {
  color: #909399;
  font-size: 12px;
}

.message-detail {
  margin-bottom: 20px;
}

.original-message {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.original-message h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.message-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.user-name {
  font-weight: bold;
  color: #409EFF;
}

.message-time {
  color: #909399;
  font-size: 12px;
}

.message-text {
  color: #606266;
  line-height: 1.5;
}

.existing-replies h4 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 14px;
}

.reply-item {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.reply-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-time {
  color: #909399;
  font-size: 12px;
}

.reply-content {
  color: #606266;
  line-height: 1.4;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.message-detail-view {
  max-height: 500px;
  overflow-y: auto;
}

.message-main-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message-main-info h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-row .label {
  font-weight: bold;
  color: #606266;
  min-width: 80px;
}

.info-row .value {
  color: #303133;
}

.message-content-full {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  line-height: 1.6;
  color: #303133;
  margin-top: 10px;
  white-space: pre-wrap;
}

.replies-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.replies-list {
  max-height: 300px;
  overflow-y: auto;
}

.reply-detail-item {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.reply-index {
  font-weight: bold;
  color: #409EFF;
}

.reply-time {
  color: #909399;
  font-size: 13px;
}

.reply-content-full {
  line-height: 1.6;
  color: #303133;
  white-space: pre-wrap;
}

.no-replies {
  text-align: center;
  padding: 40px 0;
}
</style>