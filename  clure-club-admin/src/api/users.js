import request from './request'

// 获取所有用户
export const getAllUsers = () => {
    return request({
        url: '/api/admin/user/all',
        method: 'GET'
    })
}

// 搜索用户
export const searchUsers = (data) => {
    return request({
        url: '/api/admin/user/search',
        method: 'POST',
        data
    })
}

// 创建用户
export const createUser = (data) => {
    return request({
        url: '/api/admin/user',
        method: 'POST',
        data
    })
}

// 更新用户
export const updateUser = (userId, data) => {
    return request({
        url: `/api/admin/user/${userId}`,
        method: 'PUT',
        data
    })
}

// 删除用户
export const deleteUser = (userId) => {
    return request({
        url: `/api/admin/user/${userId}`,
        method: 'DELETE'
    })
}