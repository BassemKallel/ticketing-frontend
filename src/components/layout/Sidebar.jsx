import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { HomeIcon, TicketIcon, UsersIcon, ArrowLeftOnRectangleIcon, BellIcon, ChevronDownIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline';



const Sidebar = () => {
    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'My Tickets', href: '/my-tickets', icon: TicketIcon },
        { name: 'All Tickets', href: '/tickets', icon: TicketIcon },
        { name: 'Users', href: '/users', icon: UsersIcon },
    ];

    return (
        <aside className="bg-[#1e293b] text-white w-64 flex-shrink-0 flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold">
                TikTak Pro
            </div>
            <nav className="flex-grow px-4">
                <ul>
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <NavLink
                                to={link.href}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 my-2 rounded-lg transition-colors duration-200 ${
                                    isActive ? 'bg-[#F28C38]  transition-colors duration-200 text-white' : 'text-gray-400 hover:bg-gray-400 hover:text-white'
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
                <button className="flex items-center w-full px-4 py-3 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;