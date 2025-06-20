import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
    baseURL: '/lureclub',
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

        // API错误
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
    },
    (error) => {
        console.error('响应错误:', error)

        if (error.response) {
            const { status, data } = error.response

            switch (status) {
                case 401:
                    ElMessage.error('登录已过期，请重新登录')
                    localStorage.removeItem('admin_token')
                    localStorage.removeItem('admin_info')
                    router.push('/login')
                    break
                case 403:
                    ElMessage.error('没有权限访问')
                    break
                case 404:
                    ElMessage.error('请求的资源不存在')
                    break
                case 500:
                    ElMessage.error('服务器内部错误')
                    break
                default:
                    ElMessage.error(data?.message || `请求失败 (${status})`)
            }
        } else if (error.request) {
            ElMessage.error('网络连接失败，请检查网络')
        } else {
            ElMessage.error('请求配置错误')
        }

        return Promise.reject(error)
    }
)

export default request