import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import echo from '../services/echo'; // Assurez-vous que l'instance Echo est bien importée

// 1. Création du contexte (sans l'exporter directement)
const NotificationContext = createContext(null);

// 2. Le composant "Provider" qui contient la logique
export const NotificationProvider = ({ children }) => {
    const authContext = useAuth();
    const user = authContext?.user;

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadTicketIds, setUnreadTicketIds] = useState(new Set());
    const processedNotifications = useRef(new Set());

    // Fonction pour charger les notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) {
            console.log('[Debug] fetchNotifications: Pas d\'utilisateur, nettoyage de l\'état.');
            setNotifications([]);
            setUnreadCount(0);
            setUnreadTicketIds(new Set());
            setIsLoading(false);
            return;
        }

        console.log('[Debug] fetchNotifications: Début du chargement...');
        setIsLoading(true);
        try {
            const responseData = await notificationService.getAll();

            const unread = responseData.unread || [];
            const read = responseData.read || [];
            const allNotifications = [...unread, ...read].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const initialUnreadTickets = new Set();
            unread.forEach(notification => {
                if (notification.data.type === 'new_comment' && notification.data.action_url) {
                    const ticketId = parseInt(notification.data.action_url.split('/').pop(), 10);
                    if (!isNaN(ticketId)) initialUnreadTickets.add(ticketId);
                }
            });

            setNotifications(allNotifications);
            setUnreadCount(unread.length);
            setUnreadTicketIds(initialUnreadTickets);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Effet pour écouter les notifications en temps réel via WebSocket
    useEffect(() => {
        if (user?.id) {
            const channel = echo.private(`App.Models.User.${user.id}`);

            const handleNewNotification = (event) => {
                console.log('[Debug] WebSocket: Événement "notification.nouvelle" reçu:', event);
                const nouvelleNotification = event.notificationData;
                if (processedNotifications.current.has(nouvelleNotification.id)) {
                    return;
                }

                toast.info(nouvelleNotification.data.message || 'Vous avez une nouvelle notification !');

                setNotifications(prev => [nouvelleNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                if (nouvelleNotification.data.type === 'new_comment' && nouvelleNotification.data.action_url) {
                    const ticketId = parseInt(nouvelleNotification.data.action_url.split('/').pop(), 10);
                    if (!isNaN(ticketId)) {
                        setUnreadTicketIds(prevSet => new Set(prevSet).add(ticketId));
                    }
                }

                processedNotifications.current.add(nouvelleNotification.id);
            };

            channel.listen('.notification.nouvelle', handleNewNotification);

            return () => {
                channel.stopListening('.notification.nouvelle', handleNewNotification);
                echo.leave(`App.Models.User.${user.id}`);
            };
        } else {
        }
    }, [user]);

    const markTicketAsRead = useCallback((ticketId) => {
        setUnreadTicketIds(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(ticketId);
            return newSet;
        });
    }, []);

    const markOneAsRead = async (notificationId) => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification || !notification.read_at) {
            try {
                setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n));
                setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
                await notificationService.markAsRead(notificationId);
            } catch (error) {
                fetchNotifications();
            }
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
            setUnreadTicketIds(new Set());
            await notificationService.markAllAsRead();
        } catch (error) {
            fetchNotifications();
        }
    };

    const value = {
        notifications,
        unreadCount,
        isLoading,
        unreadTicketIds,
        fetchNotifications,
        markOneAsRead,
        markAllAsRead,
        markTicketAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === null) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
