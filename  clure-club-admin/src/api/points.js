import request from './request'

// 获取所有用户积分
export const getAllUserPoints = () => {
    return request({
        url: '/api/admin/points/all',
        method: 'GET'
    })
}

// 获取指定用户积分
export const getUserPointsById = (userId) => {
    return request({
        url: `/api/admin/points/user/${userId}`,
        method: 'GET'
    })
}

// 获取用户积分历史
export const getUserPointsHistory = (userId) => {
    return request({
        url: `/api/admin/points/history/${userId}`,
        method: 'GET'
    })
}

// 录入积分
export const addUserPoints = (data) => {
    return request({
        url: '/api/admin/points/add',
        method: 'POST',
        data
    })
}

// 抵扣积分
export const deductUserPoints = (data) => {
    return request({
        url: '/api/admin/points/deduct',
        method: 'POST',
        data
    })
}