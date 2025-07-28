import apiClient from './apiClient';

const userService = {
    // Récupère tous les utilisateurs (pour la page d'administration)
    getAllUsers: () => apiClient.get('/users').then(res => res.data),

    // Récupère uniquement les agents (pour les listes déroulantes, etc.)
    // Note : Ceci nécessite la création de la route GET /api/agents dans Laravel
    getAgents: () => apiClient.get('/agents').then(res => res.data),

    // Crée un nouvel utilisateur
    createUser: (userData) => apiClient.post('/admin/users', userData).then(res => res.data),

    // Récupère un utilisateur spécifique
    getUserById: (id) => apiClient.get(`/admin/users/${id}`).then(res => res.data),

    // Met à jour un utilisateur
    updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData).then(res => res.data),

    // Supprime un utilisateur
    deleteUser: (id) => apiClient.delete(`/admin/users/${id}`).then(res => res.data),

    // Met à jour le rôle d'un utilisateur
    updateUserRole: (id, roleData) => apiClient.put(`/admin/users/${id}/assignerRole`, roleData).then(res => res.data),
};

export default userService;