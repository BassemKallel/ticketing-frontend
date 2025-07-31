import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, TicketIcon, UsersIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

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
        <header className="bg-white h-20 flex items-center justify-between px-8 border-b">
            <h1 className="text-3xl font-bold text-gray-800">Ticket Support</h1>
            <div className="flex items-center space-x-6">
                <button onClick={onOpenCreateTicket} className="bg-[#F28C38] hover:bg-[#F4C430] transition-colors duration-200 text-white px-4 py-2 rounded-lg font-semibold">Create Ticket</button>
                <div className="relative"><BellIcon className="h-6 w-6 text-gray-500" /><span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span></div>
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{user?.name.charAt(0).toUpperCase()}</div>
                    <span className="font-semibold text-gray-700">{user?.name}</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </header>
    );
};

export default Header;