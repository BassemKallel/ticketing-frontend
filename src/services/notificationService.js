// src/services/notificationService.js
import apiClient from './apiClient'; // Assurez-vous d'avoir un client Axios configuré

const notificationService = {
    getAll() {
        return apiClient.get('/notifications');
    },

    markAsRead(id) {
        return apiClient.post(`/notifications/${id}/read`);
    },

    markAllAsRead() {
        return apiClient.post('/notifications/mark-all-as-read');
    },
};

export default notificationService;