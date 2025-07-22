import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, TicketIcon, UsersIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';



const Header = () => {
    const location = useLocation();
    const getPageTitle = () => {
        switch (location.pathname) {
            case '/dashboard': return 'Dashboard';
            case '/my-tickets': return 'My Tickets';
            case '/tickets': return 'All Tickets';
            case '/users': return 'User Management';
            default: return 'Dashboard';
        }
    };
    
    return (
        <header className="bg-white h-20 flex items-center justify-between px-8 border-b">
            <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            <div className="flex items-center space-x-6">
                <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">
                    Create Ticket
                </button>
                <div className="relative">
                    <BellIcon className="h-6 w-6 text-gray-500" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        AU
                    </div>
                    <span className="font-semibold text-gray-700">Admin User</span>
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                </div>
            </div>
        </header>
    );
};

export default Header;