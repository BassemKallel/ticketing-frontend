import axios from 'axios';


const API_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
});

// Intercepteur pour ajouter automatiquement le token à chaque requête
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Intercepteur pour simplifier la gestion des erreurs
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An API error occurred';
        return Promise.reject(new Error(message));
    }
);

export default apiClient;