import request from './request'

export const getAllPrizes = () => {
    return request({
        url: '/api/admin/prize',
        method: 'GET'
    })
}

export const createPrize = (data) => {
    return request({
        url: '/api/admin/prize',
        method: 'POST',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const updatePrize = (id, data) => {
    return request({
        url: `/api/admin/prize/${id}`,
        method: 'PUT',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const deletePrize = (id) => {
    return request({
        url: `/api/admin/prize/${id}`,
        method: 'DELETE'
    })
}