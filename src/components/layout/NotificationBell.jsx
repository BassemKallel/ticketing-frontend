import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, TicketIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

// Helper function to determine the icon based on notification type
const getNotificationIcon = (type) => {
    switch (type) {
        case 'new_ticket':
            return <TicketIcon className="h-5 w-5 text-blue-500" />;
        case 'new_comment':
            return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
        default:
            return <CheckCircleIcon className="h-5 w-5 text-purple-500" />;
    }
};

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    // --- ÉTAPE 1: Récupérer la nouvelle fonction du contexte ---
    const { notifications, unreadCount, markAllAsRead, markOneAsRead } = useNotifications();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    // --- ÉTAPE 2: Mettre à jour la logique de clic ---
    const handleNotificationClick = (notification) => {
        const actionUrl = notification.data?.action_url;

        // Marque la notification comme lue si elle ne l'est pas déjà
        if (!notification.read_at && markOneAsRead) {
            markOneAsRead(notification.id);
        }

        // Navigue si une URL est disponible
        if (actionUrl) {
            setIsOpen(false);
            navigate(actionUrl);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <div className={`absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border z-20 transition-all duration-200 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="p-3 flex justify-between items-center border-b">
                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="text-sm text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(notif => {
                            const actionUrl = notif.data?.action_url;
                            const notifType = notif.data?.type;
                            return (
                                // --- ÉTAPE 3: Mettre à jour l'appel onClick ---
                                <button
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className="w-full text-left block p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            {getNotificationIcon(notifType)}
                                        </div>
                                        <div className="flex-grow">
                                            <p className={`text-sm ${!actionUrl ? 'text-gray-400' : 'text-gray-700'}`}>{notif.data.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notif.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notif.read_at && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 flex-shrink-0 self-center"></div>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-3">
                            <BellIcon className="h-10 w-10 text-gray-300" />
                            <p>Vous n'avez aucune notification.</p>
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="border-t">
                        <a href="/notifications" onClick={(e) => { e.preventDefault(); navigate('/notifications'); setIsOpen(false); }} className="block w-full text-center p-3 text-sm font-semibold text-blue-500 hover:bg-gray-50 rounded-b-lg">
                            Voir toutes les notifications
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationBell;
