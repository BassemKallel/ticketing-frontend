import apiClient from './apiClient';


const commentaireService = {
    create: (ticketId, commentData) => apiClient.post(`/commentaires/${ticketId}`, commentData).then(res => res.data),
};

export default commentaireService;