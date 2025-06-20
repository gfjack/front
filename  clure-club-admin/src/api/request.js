import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 配置 - 从环境变量读取API地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 创建axios实例
const request = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const { data } = response

        // 如果是文件下载，直接返回
        if (response.config.responseType === 'blob') {
            return response
        }

        // API正常返回
        if (data.code === 200) {
            return data
        }

        // API错误 - 只在这里显示一次错误提示
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
    },
    (error) => {
        console.error('响应错误:', error)

        if (error.response) {
            const { status, data } = error.response

            // 根据状态码显示不同的错误信息，但只显示一次
            let errorMessage = ''
            switch (status) {
                case 401:
                    errorMessage = '登录已过期，请重新登录'
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_info')
                    router.push('/login')
                    break
                case 403:
                    errorMessage = '没有权限访问'
                    break
                case 404:
                    errorMessage = '请求的资源不存在'
                    break
                case 500:
                    errorMessage = '服务器内部错误'
                    break
                default:
                    errorMessage = data?.message || `请求失败 (${status})`
            }

            // 只显示一次错误提示
            ElMessage.error(errorMessage)
        } else if (error.request) {
            ElMessage.error('网络连接失败，请检查网络')
        } else {
            ElMessage.error('请求配置错误')
        }

        return Promise.reject(error)
    }
)

// 导出API基础URL供其他地方使用
export { API_BASE_URL }
export default request