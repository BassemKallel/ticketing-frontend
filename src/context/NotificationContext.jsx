import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import echo from '../services/echo';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    // Solution: Vérification sécurisée du contexte auth
    const authContext = useAuth();
    const user = authContext?.user || null;

    const [state, setState] = useState({
        notifications: [],
        unreadCount: 0,
        isLoading: true,
        unreadTicketIds: new Set(),
    });

    const processedNotifications = useRef(new Set());
    const channelRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        // Vérification explicite de l'utilisateur
        if (!user || !user.id) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const response = await notificationService.getAll();
            const unread = response.unread || [];
            const read = response.read || [];

            const initialUnreadTickets = new Set();
            unread.forEach(notification => {
                if (notification.data?.type === 'new_comment' && notification.data?.action_url) {
                    const ticketId = notification.data.action_url.split('/').pop();
                    if (ticketId) initialUnreadTickets.add(parseInt(ticketId, 10));
                }
            });

            setState({
                notifications: [...unread, ...read].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                ),
                unreadCount: unread.length,
                unreadTicketIds: initialUnreadTickets,
                isLoading: false,
            });
        } catch (error) {
            console.error("Failed to load notifications:", error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, [user]); // Dépendance sur user

    // Gestion des WebSockets
    useEffect(() => {
        if (!user?.id) return;

        const channelName = `App.Models.User.${user.id}`;
        const channel = echo.private(channelName);
        channelRef.current = channel;

        const handleNewNotification = ({ notification }) => {
            if (!notification?.id || processedNotifications.current.has(notification.id)) return;

            processedNotifications.current.add(notification.id);

            setState(prev => {
                const isNew = !prev.notifications.some(n => n.id === notification.id);
                const newUnreadCount = isNew ? prev.unreadCount + 1 : prev.unreadCount;

                const newUnreadTickets = new Set(prev.unreadTicketIds);
                if (notification.data?.type === 'new_comment' && notification.data?.action_url) {
                    const ticketId = notification.data.action_url.split('/').pop();
                    if (ticketId) newUnreadTickets.add(parseInt(ticketId, 10));
                }

                return {
                    notifications: isNew
                        ? [notification, ...prev.notifications]
                        : prev.notifications,
                    unreadCount: newUnreadCount,
                    unreadTicketIds: newUnreadTickets,
                    isLoading: false,
                };
            });

            toast.info(notification.data?.message || 'Nouvelle notification');
        };

        channel.listen('.notification.created', handleNewNotification);

        return () => {
            channel.stopListening('.notification.created');
            echo.leave(channelName);
            channelRef.current = null;
        };
    }, [user]);

    const markOneAsRead = useCallback(async (notificationId) => {
        try {
            setState(prev => {
                const updatedNotifications = prev.notifications.map(n =>
                    n.id === notificationId && !n.read_at
                        ? { ...n, read_at: new Date().toISOString() }
                        : n
                );

                return {
                    ...prev,
                    notifications: updatedNotifications,
                    unreadCount: Math.max(0, prev.unreadCount - 1),
                };
            });

            await notificationService.markAsRead(notificationId);
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        if (state.unreadCount === 0) return;

        try {
            setState(prev => ({
                ...prev,
                notifications: prev.notifications.map(n =>
                    !n.read_at ? { ...n, read_at: new Date().toISOString() } : n
                ),
                unreadCount: 0,
                unreadTicketIds: new Set(),
            }));

            await notificationService.markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
            fetchNotifications();
        }
    }, [state.unreadCount, fetchNotifications]);

    const markTicketAsRead = useCallback((ticketId) => {
        setState(prev => {
            const newSet = new Set(prev.unreadTicketIds);
            newSet.delete(ticketId);
            return { ...prev, unreadTicketIds: newSet };
        });
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            ...state,
            fetchNotifications,
            markOneAsRead,
            markAllAsRead,
            markTicketAsRead,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};