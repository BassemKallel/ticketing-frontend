import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext'; // Assurez-vous que le chemin est correct
import { TicketIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';

// Helper pour formater les dates et les regrouper
const groupNotificationsByDate = (notifications) => {
    const groups = {
        Aujourdhui: [],
        Hier: [],
        'Plus ancien': [],
    };

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isSameDay = (d1, d2) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    notifications.forEach(notif => {
        const notifDate = new Date(notif.created_at);
        if (isSameDay(notifDate, today)) {
            groups.Aujourdhui.push(notif);
        } else if (isSameDay(notifDate, yesterday)) {
            groups.Hier.push(notif);
        } else {
            groups['Plus ancien'].push(notif);
        }
    });

    return groups;
};

// Helper pour afficher la bonne icône
const getNotificationIcon = (type) => {
    switch (type) {
        case 'new_ticket': return <TicketIcon className="h-6 w-6 text-orange-500" />;
        case 'new_comment': return <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />;
        default: return <CheckCircleIcon className="h-6 w-6 text-purple-500" />;
    }
};

const NotificationsPage = () => {
    const { notifications, markAllAsRead, markOneAsRead } = useNotifications();
    const navigate = useNavigate();

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markOneAsRead(notification.id);
        }
        if (notification.data?.action_url) {
            navigate(notification.data.action_url);
        }
    };

    const groupedNotifications = groupNotificationsByDate(notifications);

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
                <button
                    onClick={markAllAsRead}
                    className="text-sm font-semibold text-orange-600 hover:underline"
                >
                    Tout marquer comme lu
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                {notifications.length > 0 ? (
                    Object.keys(groupedNotifications).map(groupName => (
                        groupedNotifications[groupName].length > 0 && (
                            <div key={groupName} className="p-4">
                                <h2 className="text-lg font-semibold text-gray-600 mb-3">{groupName}</h2>
                                <ul className="space-y-2">
                                    {groupedNotifications[groupName].map(notif => (
                                        <li
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`flex items-start gap-4 p-3 rounded-lg transition-colors cursor-pointer ${notif.read_at ? 'bg-gray-50' : 'bg-orange-50 hover:bg-orange-100'}`}
                                        >
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notif.data.type)}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm text-gray-700">{notif.data.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                            </div>
                                            {!notif.read_at && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0 self-center" title="Non lue"></div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))
                ) : (
                    <div className="text-center p-12 text-gray-500">
                        <EnvelopeOpenIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold">Boîte de réception vide</h3>
                        <p className="mt-1">Vous n'avez aucune notification pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
