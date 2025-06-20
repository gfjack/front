// import request from './request'
//
// // 公告管理API
// export const getAllAnnouncements = () => {
//     return request({
//         url: '/api/admin/announcement',
//         method: 'GET'
//     })
// }
//
// export const createAnnouncement = (data) => {
//     return request({
//         url: '/api/admin/announcement',
//         method: 'POST',
//         data
//     })
// }
//
// export const updateAnnouncement = (id, data) => {
//     return request({
//         url: `/api/admin/announcement/${id}`,
//         method: 'PUT',
//         data
//     })
// }
//
// export const deleteAnnouncement = (id) => {
//     return request({
//         url: `/api/admin/announcement/${id}`,
//         method: 'DELETE'
//     })
// }
//
// // 奖品管理API
// export const getAllPrizes = () => {
//     return request({
//         url: '/api/admin/prize',
//         method: 'GET'
//     })
// }
//
// export const createPrize = (data) => {
//     return request({
//         url: '/api/admin/prize',
//         method: 'POST',
//         data,
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     })
// }
//
// export const updatePrize = (id, data) => {
//     return request({
//         url: `/api/admin/prize/${id}`,
//         method: 'PUT',
//         data,
//         headers: {
//             'Content-Type': 'multipart/form-data'
//         }
//     })
// }
//
// export const deletePrize = (id) => {
//     return request({
//         url: `/api/admin/prize/${id}`,
//         method: 'DELETE'
//     })
// }
//
// // 留言管理API
// export const getAllMessages = () => {
//     return request({
//         url: '/api/admin/message',
//         method: 'GET'
//     })
// }
//
// export const replyMessage = (messageId, data) => {
//     return request({
//         url: `/api/admin/message/${messageId}/reply`,
//         method: 'POST',
//         data
//     })
// }
//
// export const setMessageVisibility = (messageId, isVisible) => {
//     return request({
//         url: `/api/admin/message/${messageId}/visibility`,
//         method: 'PUT',
//         params: { isVisible }
//     })
// }
//
// // 排行榜API
// export const getDailyRanking = () => {
//     return request({
//         url: '/api/admin/ranking/daily',
//         method: 'GET'
//     })
// }
//
// export const getWeeklyRanking = () => {
//     return request({
//         url: '/api/admin/ranking/weekly',
//         method: 'GET'
//     })
// }
//
// export const getTotalRanking = () => {
//     return request({
//         url: '/api/admin/ranking/total',
//         method: 'GET'
//     })
// }