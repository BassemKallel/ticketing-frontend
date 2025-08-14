import apiClient from "./apiClient";
const authService = {
    register: async (userData) => {
        const response = await apiClient.post('/register', userData);
        return response.data;
    },
    login: async (credentials) => {
        const response = await apiClient.post('/login', credentials);
        return response.data;
    },
    logout: () => apiClient.post('/logout'),
    getCurrentUser: async () => {
        const response = await apiClient.get('/user');
        return response.data;
    },
};

export default authService;