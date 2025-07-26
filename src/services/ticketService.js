import apiClient from "./apiClient";


const ticketService = {
    // GET /tickets
    getAll: (params) => apiClient.get('/tickets', { params }).then(res => res.data),
    
    // GET /tickets/{id}
    getById: (id) => apiClient.get(`/tickets/${id}`).then(res => res.data),

    // POST /tickets
    create: (ticketData) => apiClient.post('/tickets', ticketData).then(res => res.data),

    // PUT /tickets/{id}/status
    updateStatus: (id, statusData) => apiClient.put(`/tickets/${id}/status`, statusData).then(res => res.data),
    
    // POST /tickets/{id}/assignerAgent
    assignAgent: (id, agentData) => apiClient.post(`/tickets/${id}/assignerAgent`, agentData).then(res => res.data),

    // DELETE /tickets/{id}
    delete: (id) => apiClient.delete(`/tickets/${id}`).then(res => res.data),

    // GET /tickets/mytickets
    getMyTickets: () => apiClient.get('/tickets/mytickets').then(res => res.data),
};

export default ticketService;