import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService'; // Assurez-vous que le chemin est correct
import { useAuth } from '../hooks/useAuth';

// 1. Création du contexte
const NotificationContext = createContext();

// 2. Hook personnalisé pour utiliser le contexte plus facilement
export const useNotifications = () => useContext(NotificationContext);

// 3. Le composant "Provider" qui contiendra toute la logique
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth(); // On récupère l'utilisateur pour savoir quand lancer les appels API

    // Fonction pour charger les notifications depuis le backend
    const fetchNotifications = useCallback(async () => {
        if (!user) return; // Ne fait rien si l'utilisateur n'est pas connecté
        try {
            const response = await notificationService.getAll();
            const unread = response.data.unread || [];
            const read = response.data.read || [];
            
            // On combine les notifications lues et non lues, puis on les trie par date de création
            const allNotifications = [...unread, ...read].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setNotifications(allNotifications);
            setUnreadCount(unread.length);
        } catch (error) {
            console.error("Impossible de charger les notifications :", error);
            // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
        }
    }, [user]);

    // Effet pour charger les notifications au démarrage (quand l'utilisateur est disponible)
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Fonction pour marquer une seule notification comme lue
    const markOneAsRead = async (notificationId) => {
        const notification = notifications.find(n => n.id === notificationId);
        // On ne fait rien si la notification n'existe pas ou est déjà lue
        if (!notification || notification.read_at) {
            return;
        }

        try {
            // Mise à jour optimiste de l'interface pour une meilleure réactivité
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
            setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));

            // Appel API en arrière-plan
            await notificationService.markAsRead(notificationId);
        } catch (error) {
            console.error("Impossible de marquer la notification comme lue :", error);
            // En cas d'échec, on pourrait annuler la mise à jour de l'interface
            fetchNotifications(); // Recharge les données pour corriger l'état
        }
    };

    // Fonction pour marquer toutes les notifications comme lues
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        try {
            // Mise à jour optimiste
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
            
            // Appel API
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error("Erreur lors du marquage des notifications comme lues :", error);
            fetchNotifications(); // Recharge les données pour corriger l'état
        }
    };

    // 4. Les valeurs que le contexte va fournir à ses enfants
    const value = {
        notifications,
        unreadCount,
        fetchNotifications,
        markOneAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
