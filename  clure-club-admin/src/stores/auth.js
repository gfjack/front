import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, getCurrentAdmin } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('admin_token') || '')
    const adminInfo = ref(JSON.parse(localStorage.getItem('admin_info') || 'null'))

    // 登录
    const login = async (loginData) => {
        try {
            const response = await apiLogin(loginData)
            // 如果执行到这里，说明API调用成功（response.code === 200）
            token.value = response.data.token
            adminInfo.value = response.data.adminInfo

            localStorage.setItem('admin_token', token.value)
            localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))

            return { success: true }
        } catch (error) {
            // API层已经处理了错误提示，这里只返回失败状态
            console.error('登录API调用失败:', error)
            return { success: false, message: error.message }
        }
    }

    // 登出
    const logout = () => {
        token.value = ''
        adminInfo.value = null
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_info')
    }

    // 获取当前管理员信息
    const fetchCurrentAdmin = async () => {
        try {
            const response = await getCurrentAdmin()
            if (response.code === 200) {
                adminInfo.value = response.data
                localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
            }
        } catch (error) {
            console.error('获取管理员信息失败:', error)
        }
    }

    return {
        token,
        adminInfo,
        login,
        logout,
        fetchCurrentAdmin
    }
})