import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, TicketIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, EnvelopeOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

// --- Helpers pour l'affichage ---

// Helper pour déterminer l'icône et sa couleur avec thème orange
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
            return <BellIcon className="h-5 w-5 text-orange-500" />;
    }
};

// Helper pour formater les dates de manière plus lisible
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

// Helper pour regrouper les notifications par date
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

    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

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

// --- Composant Principal ---

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead, markOneAsRead, isLoading } = useNotifications();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleToggle = () => setIsOpen(!isOpen);

    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markOneAsRead(notification.id);
        }
        if (notification.data?.action_url) {
            navigate(notification.data.action_url);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const groupedNotifications = groupNotificationsByDate(notifications);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-orange-50 focus:bg-orange-50  transition-all duration-200"
            >
                <BellIcon className={`h-6 w-6 transition-colors duration-200 ${unreadCount > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown simple */}
            <div className={`absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl  z-50 transition-all duration-200 ease-out ${isOpen
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}>

                {/* Header simple */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-orange-400 hover:text-orange-300 hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                </div>

                {/* Liste des notifications */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-sm text-gray-500">Chargement...</div>
                    ) : notifications.length > 0 ? (
                        Object.entries(groupedNotifications).map(([groupName, groupNotifications]) =>
                            groupNotifications.length > 0 && (
                                <div key={groupName}>
                                    <h4 className="text-xs font-bold uppercase text-gray-500 px-4 pt-4 pb-2">
                                        {groupName}
                                    </h4>
                                    {groupNotifications.map(notif => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`w-full text-left p-3 transition-colors ${!notif.read_at
                                                    ? 'bg-orange-50 hover:bg-orange-100'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {getNotificationIcon(notif.data?.type)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-sm text-gray-700">{notif.data?.message}</p>
                                                    <p className={`text-xs mt-1 ${!notif.read_at ? 'text-orange-600 font-semibold' : 'text-gray-500'
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
                            )
                        )
                    ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                                <EnvelopeOpenIcon className="h-8 w-8 text-orange-300" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-700">Aucune notification</p>
                                <p className="text-sm text-gray-500 mt-1">Les nouvelles notifications apparaîtront ici.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <button
                            onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                            className="block w-full text-center p-4 text-sm font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-50 rounded-b-xl transition-colors duration-200"
                        >
                            Voir toutes les notifications →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationBell;