import request from './request'

export const getDailyRanking = () => {
    return request({
        url: '/api/admin/ranking/daily',
        method: 'GET'
    })
}

export const getWeeklyRanking = () => {
    return request({
        url: '/api/admin/ranking/weekly',
        method: 'GET'
    })
}

export const getTotalRanking = () => {
    return request({
        url: '/api/admin/ranking/total',
        method: 'GET'
    })
}