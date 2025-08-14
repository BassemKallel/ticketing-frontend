import apiClient from './apiClient';

const statisticsService = {
    /**
     * Récupère les statistiques depuis le backend.
     * L'API renverra des données différentes en fonction du rôle de l'utilisateur authentifié.
     */
    getStats: () => apiClient.get('/stats').then(res => res.data),
};

export default statisticsService;
