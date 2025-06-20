import request from './request'

// 管理员登录
export const login = (data) => {
    return request({
        url: '/api/admin/auth/login',
        method: 'POST',
        data
    })
}

// 获取当前管理员信息
export const getCurrentAdmin = () => {
    return request({
        url: '/api/admin/auth/current',
        method: 'GET'
    })
}

// 创建管理员
export const createAdmin = (data) => {
    return request({
        url: '/api/admin/auth/create',
        method: 'POST',
        data
    })
}

// 登出
export const logout = () => {
    return request({
        url: '/api/admin/auth/logout',
        method: 'POST'
    })
}