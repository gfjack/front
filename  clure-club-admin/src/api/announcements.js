import request from './request'

export const getAllAnnouncements = () => {
    return request({
        url: '/api/admin/announcement',
        method: 'GET'
    })
}

export const createAnnouncement = (data) => {
    return request({
        url: '/api/admin/announcement',
        method: 'POST',
        data
    })
}

export const updateAnnouncement = (id, data) => {
    return request({
        url: `/api/admin/announcement/${id}`,
        method: 'PUT',
        data
    })
}

export const deleteAnnouncement = (id) => {
    return request({
        url: `/api/admin/announcement/${id}`,
        method: 'DELETE'
    })
}