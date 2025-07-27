import apiClient from './apiClient';


const commentaireService = {
    create: (ticketId, commentData) => apiClient.post(`/commentaires/${ticketId}`, commentData).then(res => res.data),
    delete: (commentId) => apiClient.delete(`/commentaires/${commentId}`).then(res => res.data),
};

export default commentaireService;