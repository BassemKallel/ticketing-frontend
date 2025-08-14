import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService'; 

export const AuthContext = createContext(null); // CORRECTION : Exportation du contexte

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const navigate = useNavigate();

    const loginAction = async (credentials) => {
        try {
            const data = await authService.login(credentials);
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logoutAction = async () => {
        try {
            await authService.logout();
        } catch(error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            navigate('/login');
        }
    };

    const value = { user, token, login: loginAction, logout: logoutAction };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

