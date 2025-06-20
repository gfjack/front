import request from './request'

export const getAllMessages = () => {
    return request({
        url: '/api/admin/message',
        method: 'GET'
    })
}

export const replyMessage = (messageId, data) => {
    return request({
        url: `/api/admin/message/${messageId}/reply`,
        method: 'POST',
        data
    })
}

export const setMessageVisibility = (messageId, isVisible) => {
    return request({
        url: `/api/admin/message/${messageId}/visibility`,
        method: 'PUT',
        params: { isVisible }
    })
}