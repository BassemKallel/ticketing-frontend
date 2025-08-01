import apiClient from "./apiClient";



const notificationService ={

    getAll: () => apiClient.get('/notifications').then(res => res.data),
    markAsRead: (notificationId) => apiClient.post(`/notifications/${notificationId}/read`).then(res => res.data),
    markAllAsRead: () => apiClient.post('/notifications/read-all').then(res => res.data),

}

export default notificationService;