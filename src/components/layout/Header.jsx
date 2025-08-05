import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, TicketIcon, UsersIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import NotificationBell from './NotificationBell';

const Header = ({ onOpenCreateTicket }) => {
    const { user } = useAuth();
    const location = useLocation();
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.startsWith('/tickets/')) return 'Ticket Details';
        switch (path) {
            case '/dashboard': return 'Dashboard';
            case '/my-tickets': return 'My Tickets';
            case '/tickets': return 'All Tickets';
            case '/users': return 'User Management';
            default: return 'Dashboard';
        }
    };
    return (
        <header className="bg-white h-20 flex items-center justify-between px-8 shadow-md">
            <h1 className="text-3xl font-bold text-gray-800">Ticket Support</h1>
            <div className="flex items-center space-x-6">
                <NotificationBell />
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{user?.name.charAt(0).toUpperCase()}</div>
                    <span className="font-semibold text-gray-700">{user?.name}</span>
                </div>
            </div>
        </header>
    );
};

export default Header;