import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { TicketIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, EnvelopeOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const groupNotificationsByDate = (notifications) => {
    const groups = {
        "Aujourd'hui": [],
        "Hier": [],
        "Cette semaine": [],
        "Plus ancien": [],
    };

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    notifications.forEach(notif => {
        const notifDate = new Date(notif.created_at);
        if (isSameDay(notifDate, today)) {
            groups["Aujourd'hui"].push(notif);
        } else if (isSameDay(notifDate, yesterday)) {
            groups["Hier"].push(notif);
        } else if (notifDate > weekAgo) {
            groups["Cette semaine"].push(notif);
        } else {
            groups["Plus ancien"].push(notif);
        }
    });

    return groups;
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'new_ticket':
            return <TicketIcon className="h-5 w-5 text-orange-500" />;
        case 'new_comment':
            return <ChatBubbleLeftRightIcon className="h-5 w-5 text-orange-600" />;
        case 'status_updated':
            return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
        case 'attachment':
            return <ClockIcon className="h-5 w-5 text-orange-400" />;
        default:
            return <CheckCircleIcon className="h-5 w-5 text-orange-500" />;
    }
};

const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 30) return "à l'instant";
    if (diffInMinutes < 1) return "il y a quelques secondes";
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    if (diffInDays === 1) return `hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffInDays < 7) return `il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const NotificationsPage = () => {
    const {
        notifications,
        unreadCount,
        markAllAsRead,
        markOneAsRead,
        fetchNotifications,
        isLoading
    } = useNotifications();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();

        // WebSocket listener (adaptez selon votre implémentation)
        const channel = window.Echo?.private(`App.Models.User.${user?.id}`);

        if (channel) {
            channel.listen('.notification.created', (data) => {
                fetchNotifications();
                toast.info("Nouvelle notification reçue");
            });
        }

        return () => {
            if (channel) {
                channel.stopListening('.notification.created');
            }
        };
    }, [fetchNotifications]);

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markOneAsRead(notification.id);
        }
        if (notification.data?.action_url) {
            navigate(notification.data.action_url);
        }
    };

    const groupedNotifications = groupNotificationsByDate(notifications);

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-sm text-gray-500">Chargement des notifications...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                    {unreadCount > 0 && (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-orange-600 hover:text-orange-700 hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        </div>
                    )}
                </div>

            {/* Liste des notifications */}
            <div className="bg-white rounded-lg shadow">
                {notifications.length > 0 ? (
                    Object.entries(groupedNotifications).map(([groupName, groupNotifications]) =>
                        groupNotifications.length > 0 && (
                            <div key={groupName}>
                                <div className="bg-gray-50 text-gray-700 px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-sm font-bold uppercase text-gray-500 tracking-wider">
                                        {groupName}
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {groupNotifications.map(notif => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full text-left p-6 transition-colors ${!notif.read_at
                                                    ? 'bg-orange-50 hover:bg-orange-100'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {getNotificationIcon(notif.data?.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {notif.data?.message}
                                                    </p>
                                                    <p className={`text-xs mt-2 ${!notif.read_at ? 'text-orange-600 font-semibold' : 'text-gray-500'
                                                        }`}>
                                                        {formatRelativeDate(notif.created_at)}
                                                    </p>
                                                </div>
                                                {!notif.read_at && (
                                                    <div className="h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0 self-center"
                                                        title="Non lue">
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )
                    )
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <EnvelopeOpenIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700">Aucune notification</h3>
                        <p className="text-sm mt-2">Les nouvelles notifications apparaîtront ici.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;