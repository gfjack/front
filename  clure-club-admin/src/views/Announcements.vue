<template>
  <div class="announcements-page">
    <div class="page-header">
      <h1 class="page-title">公告管理</h1>
      <el-button type="primary" icon="Plus" @click="openCreateDialog">
        发布公告
      </el-button>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="发布时间">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilter"
          />
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-select v-model="filterForm.isTop" placeholder="请选择" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="置顶" :value="true" />
            <el-option label="普通" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序方式">
          <el-select v-model="filterForm.sortBy" @change="handleFilter">
            <el-option label="发布时间降序" value="publishDate_desc" />
            <el-option label="发布时间升序" value="publishDate_asc" />
            <el-option label="创建时间降序" value="createTime_desc" />
            <el-option label="创建时间升序" value="createTime_asc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleFilter">
            筛选
          </el-button>
          <el-button icon="Refresh" @click="resetFilter">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 公告列表 -->
    <el-card class="table-card">
      <el-table
          v-loading="loading"
          :data="filteredAnnouncementList"
          stripe
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="content" label="内容" min-width="300">
          <template #default="{ row }">
            <div class="content-preview">
              {{ getContentPreview(row.content) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="publishDate" label="发布日期" width="120" sortable>
          <template #default="{ row }">
            {{ formatDate(row.publishDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="isTop" label="置顶" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isTop" type="danger" size="small">置顶</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" sortable>
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
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
                  icon="Edit"
                  @click="openEditDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="handleDelete(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 公告详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="公告详情"
        width="800px"
        :close-on-click-modal="false"
    >
      <div v-if="currentDetailAnnouncement" class="announcement-detail-view">
        <div class="announcement-header">
          <h2 class="announcement-title">{{ currentDetailAnnouncement.title }}</h2>
          <div class="announcement-meta">
            <div class="meta-item">
              <span class="meta-label">发布日期：</span>
              <span class="meta-value">{{ formatDate(currentDetailAnnouncement.publishDate) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间：</span>
              <span class="meta-value">{{ formatTime(currentDetailAnnouncement.createTime) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">状态：</span>
              <el-tag v-if="currentDetailAnnouncement.isTop" type="danger" size="small">置顶</el-tag>
              <el-tag v-else type="info" size="small">普通</el-tag>
            </div>
          </div>
        </div>

        <div class="announcement-content">
          <h4>公告内容：</h4>
          <div class="content-text">
            {{ currentDetailAnnouncement.content }}
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editFromDetail">
            编辑公告
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 公告表单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑公告' : '发布公告'"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="announcementFormRef"
          :model="announcementForm"
          :rules="announcementRules"
          label-width="100px"
      >
        <el-form-item label="公告标题" prop="title">
          <el-input
              v-model="announcementForm.title"
              placeholder="请输入公告标题"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="公告内容" prop="content">
          <el-input
              v-model="announcementForm.content"
              type="textarea"
              placeholder="请输入公告内容"
              :rows="8"
              maxlength="2000"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="发布日期" prop="publishDate">
          <el-date-picker
              v-model="announcementForm.publishDate"
              type="date"
              placeholder="选择发布日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="是否置顶">
          <el-switch
              v-model="announcementForm.isTop"
              active-text="置顶"
              inactive-text="普通"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '发布' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/api/announcements'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const announcementFormRef = ref()

const announcementList = ref([])
const currentDetailAnnouncement = ref(null)

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  isTop: '',
  sortBy: 'publishDate_desc'
})

const announcementForm = reactive({
  title: '',
  content: '',
  publishDate: '',
  isTop: false
})

const announcementRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { max: 2000, message: '内容长度不能超过2000个字符', trigger: 'blur' }
  ],
  publishDate: [
    { required: true, message: '请选择发布日期', trigger: 'change' }
  ]
}

// 筛选后的公告列表
const filteredAnnouncementList = computed(() => {
  let list = [...announcementList.value]

  // 时间筛选
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const [startDate, endDate] = filterForm.dateRange
    list = list.filter(item => {
      const publishDate = item.publishDate
      return publishDate >= startDate && publishDate <= endDate
    })
  }

  // 置顶筛选
  if (filterForm.isTop !== '') {
    list = list.filter(item => item.isTop === filterForm.isTop)
  }

  // 排序
  list.sort((a, b) => {
    const [field, order] = filterForm.sortBy.split('_')
    const aValue = new Date(a[field])
    const bValue = new Date(b[field])

    if (order === 'desc') {
      return bValue - aValue
    } else {
      return aValue - bValue
    }
  })

  return list
})

const loadAnnouncements = async () => {
  try {
    loading.value = true
    const response = await getAllAnnouncements()
    if (response.code === 200) {
      announcementList.value = response.data || []
    }
  } catch (error) {
    console.error('加载公告列表失败:', error)
    ElMessage.error('加载公告列表失败')
  } finally {
    loading.value = false
  }
}

const handleFilter = () => {
  // 筛选操作，实际上是通过计算属性自动完成的
}

const resetFilter = () => {
  filterForm.dateRange = []
  filterForm.isTop = ''
  filterForm.sortBy = 'publishDate_desc'
}

const openDetailDialog = (row) => {
  currentDetailAnnouncement.value = row
  detailDialogVisible.value = true
}

const editFromDetail = () => {
  detailDialogVisible.value = false
  openEditDialog(currentDetailAnnouncement.value)
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
  // 默认设置为今天
  announcementForm.publishDate = new Date().toISOString().split('T')[0]
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  announcementForm.id = row.id
  announcementForm.title = row.title
  announcementForm.content = row.content
  announcementForm.publishDate = row.publishDate
  announcementForm.isTop = row.isTop || false
}

const resetForm = () => {
  announcementForm.id = null
  announcementForm.title = ''
  announcementForm.content = ''
  announcementForm.publishDate = ''
  announcementForm.isTop = false
  announcementFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    await announcementFormRef.value.validate()
    submitLoading.value = true

    let response
    if (isEdit.value) {
      response = await updateAnnouncement(announcementForm.id, announcementForm)
    } else {
      response = await createAnnouncement(announcementForm)
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '公告更新成功' : '公告发布成功')
      dialogVisible.value = false
      loadAnnouncements()
    }
  } catch (error) {
    console.error('提交公告失败:', error)
    ElMessage.error('提交公告失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除公告 "${row.title}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await deleteAnnouncement(row.id)
    if (response.code === 200) {
      ElMessage.success('公告删除成功')
      loadAnnouncements()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除公告失败:', error)
      ElMessage.error('删除公告失败')
    }
  }
}

const getContentPreview = (content) => {
  if (!content) return ''
  return content.length > 100 ? content.substring(0, 100) + '...' : content
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
  loadAnnouncements()
})
</script>

<style scoped>
.announcements-page {
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

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  border-radius: 8px;
  overflow: hidden;
}

.content-preview {
  line-height: 1.4;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.announcement-detail-view {
  max-height: 600px;
  overflow-y: auto;
}

.announcement-header {
  border-bottom: 2px solid #e4e7ed;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.announcement-title {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.announcement-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
}

.meta-value {
  color: #303133;
}

.announcement-content h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 15px 0;
}

.content-text {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  line-height: 1.8;
  color: #303133;
  white-space: pre-wrap;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  flex-shrink: 0;
}
</style>