<template>
  <div class="prizes-page">
    <div class="page-header">
      <h1 class="page-title">奖品管理</h1>
      <el-button type="primary" icon="Plus" @click="openCreateDialog">
        添加奖品
      </el-button>
    </div>

    <!-- 奖品列表 -->
    <el-card class="table-card">
      <el-table
          v-loading="loading"
          :data="prizeList"
          stripe
          style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <div class="prize-image">
              <img
                  v-if="row.imageUrl"
                  :src="getImageUrl(row.imageUrl)"
                  alt="奖品图片"
                  @error="handleImageError"
              />
              <div v-else class="no-image">
                <el-icon><Picture /></el-icon>
                <span>暂无图片</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="奖品名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <div class="description-preview">
              {{ getDescriptionPreview(row.description) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="isEnabled" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'danger'" size="small">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
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
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 奖品表单对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑奖品' : '添加奖品'"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="prizeFormRef"
          :model="prizeForm"
          :rules="prizeRules"
          label-width="100px"
      >
        <el-form-item label="奖品名称" prop="name">
          <el-input
              v-model="prizeForm.name"
              placeholder="请输入奖品名称"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="奖品描述" prop="description">
          <el-input
              v-model="prizeForm.description"
              type="textarea"
              placeholder="请输入奖品描述"
              :rows="4"
              maxlength="1000"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="奖品图片">
          <div class="upload-section">
            <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleImageChange"
                accept="image/*"
            >
              <el-button type="primary" icon="Upload">选择图片</el-button>
            </el-upload>

            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="图片预览" />
              <el-button
                  type="danger"
                  size="small"
                  icon="Delete"
                  @click="removeImage"
                  class="remove-btn"
              >
                移除
              </el-button>
            </div>

            <div class="upload-tips">
              支持 JPG、PNG、GIF 格式，文件大小不超过 10MB
            </div>
          </div>
        </el-form-item>

        <el-form-item label="排序序号">
          <el-input-number
              v-model="prizeForm.sortOrder"
              :min="0"
              :max="999"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch
              v-model="prizeForm.isEnabled"
              active-text="启用"
              inactive-text="禁用"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllPrizes, createPrize, updatePrize, deletePrize } from '@/api/prizes'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const prizeFormRef = ref()
const uploadRef = ref()

const prizeList = ref([])
const imagePreview = ref('')
const selectedImageFile = ref(null)

const prizeForm = reactive({
  name: '',
  description: '',
  sortOrder: 0,
  isEnabled: true
})

const prizeRules = {
  name: [
    { required: true, message: '请输入奖品名称', trigger: 'blur' },
    { max: 200, message: '名称长度不能超过200个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入奖品描述', trigger: 'blur' },
    { max: 1000, message: '描述长度不能超过1000个字符', trigger: 'blur' }
  ]
}

const loadPrizes = async () => {
  try {
    loading.value = true
    const response = await getAllPrizes()
    if (response.code === 200) {
      prizeList.value = response.data
    }
  } catch (error) {
    console.error('加载奖品列表失败:', error)
    ElMessage.error('加载奖品列表失败')
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

const openEditDialog = (row) => {
  isEdit.value = true
  dialogVisible.value = true
  prizeForm.id = row.id
  prizeForm.name = row.name
  prizeForm.description = row.description
  prizeForm.sortOrder = row.sortOrder || 0
  prizeForm.isEnabled = row.isEnabled !== false

  // 显示现有图片
  if (row.imageUrl) {
    imagePreview.value = getImageUrl(row.imageUrl)
  }
}

const resetForm = () => {
  prizeForm.id = null
  prizeForm.name = ''
  prizeForm.description = ''
  prizeForm.sortOrder = 0
  prizeForm.isEnabled = true
  imagePreview.value = ''
  selectedImageFile.value = null
  if (prizeFormRef.value) {
    prizeFormRef.value.clearValidate()
  }
}

const handleImageChange = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只支持 JPG、PNG、GIF、WEBP 格式的图片')
    return
  }

  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 10MB')
    return
  }

  selectedImageFile.value = file.raw

  // 创建预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const removeImage = () => {
  imagePreview.value = ''
  selectedImageFile.value = null
}

const handleSubmit = async () => {
  try {
    if (!prizeFormRef.value) return
    await prizeFormRef.value.validate()
    submitLoading.value = true

    // 创建 FormData
    const formData = new FormData()
    formData.append('name', prizeForm.name)
    formData.append('description', prizeForm.description)
    formData.append('sortOrder', prizeForm.sortOrder)

    if (selectedImageFile.value) {
      formData.append('imageFile', selectedImageFile.value)
    }

    let response
    if (isEdit.value) {
      formData.append('isEnabled', prizeForm.isEnabled)
      response = await updatePrize(prizeForm.id, formData)
    } else {
      response = await createPrize(formData)
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '奖品更新成功' : '奖品创建成功')
      dialogVisible.value = false
      loadPrizes()
    }
  } catch (error) {
    console.error('提交奖品信息失败:', error)
    ElMessage.error('提交奖品信息失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确定要删除奖品 "${row.name}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await deletePrize(row.id)
    if (response.code === 200) {
      ElMessage.success('奖品删除成功')
      loadPrizes()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除奖品失败:', error)
      ElMessage.error('删除奖品失败')
    }
  }
}

const getImageUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `/lureclub${url}`
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  const parent = e.target.parentElement
  const noImageDiv = parent.querySelector('.no-image')
  if (noImageDiv) {
    noImageDiv.style.display = 'flex'
  }
}

const getDescriptionPreview = (description) => {
  if (!description) return ''
  return description.length > 80 ? description.substring(0, 80) + '...' : description
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString()
}

onMounted(() => {
  loadPrizes()
})
</script>

<style scoped>
.prizes-page {
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

.table-card {
  border-radius: 8px;
  overflow: hidden;
}

.prize-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
}

.prize-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 12px;
}

.description-preview {
  line-height: 1.4;
  color: #606266;
}

.upload-section {
  width: 100%;
}

.image-preview {
  margin-top: 10px;
  position: relative;
  display: inline-block;
}

.image-preview img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
}

.upload-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>