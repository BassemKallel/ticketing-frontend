import React from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const UserFilters = ({ filters, setFilters, onReset }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="relative md:col-span-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        name="search"
                        value={filters.search || ''}
                        onChange={handleInputChange}
                        placeholder="Rechercher par nom ou email..."
                        className="w-full pl-10 pr-4 py-2 border-gray-300 rounded-lg  focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                <div className="md:col-span-1">
                    <select
                        name="role"
                        value={filters.role || ''}
                        onChange={handleInputChange}
                        className="w-full border rounded-lg px-4 py-2 border-gray-300  focus:ring-2 focus:ring-orange-400"
                    >
                        <option value="">Tous les Rôles</option>
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="client">Client</option>
                    </select>
                </div>

                <div className="md:col-span-1">
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-2 w-full md:w-auto md:ml-auto border rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Réinitialiser</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserFilters;
