import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, TicketIcon, UsersIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';


const Sidebar = () => {
    const { user, logout } = useAuth();

    const allLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'agent', 'client'] },
        { name: 'All Tickets', href: '/tickets', icon: TicketIcon, roles: ['admin', 'agent'] },
        { name: 'My Tickets', href: '/mytickets', icon: TicketIcon, roles: ['client', 'agent'] },
        { name: 'Users', href: '/users', icon: UsersIcon, roles: ['admin'] },
    ];

    const visibleLinks = allLinks.filter(link => link.roles.includes(user?.role));

    return (
        <aside className="bg-[#1e293b] text-white w-64 flex-shrink-0 flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold">
                TikTak Pro
            </div>
            <nav className="flex-grow px-4">
                <ul>
                    {visibleLinks.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.href}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
                                    isActive ? 'bg-[#F28C38] text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                <link.icon className="h-6 w-6 mr-3" />
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <button 
                    onClick={logout} 
                    className="flex items-center w-full px-4 py-3 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white"
                >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;