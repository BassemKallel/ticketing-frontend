import apiClient from "./apiClient";

const pieceJointeService = {
    
    create: (ticketId, formData) => apiClient.post(`/pieces-jointes/${ticketId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data),

    delete: (id) => apiClient.delete(`/pieces-jointes/${id}`).then(res => res.data),
};

export default pieceJointeService;