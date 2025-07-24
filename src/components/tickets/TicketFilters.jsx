import React from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth'; 

const TicketFilters = ({ filters = {}, setFilters, agents = [], onReset }) => {
    const { user } = useAuth(); // On récupère l'utilisateur connecté

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="relative md:col-span-2">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="search" value={filters.search || ''} onChange={handleInputChange} placeholder="Search Tickets..." className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <select name="status" value={filters.status || ''} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Status</option>
                    <option value="Ouvert">Open</option>
                    <option value="En_cours">In Progress</option>
                    <option value="Resolu">Resolved</option>
                    <option value="Fermé">Closed</option>
                </select>
                <select name="priority" value={filters.priority || ''} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Priorities</option>
                    <option value="Bloquage">High</option>
                    <option value="Demande">Medium</option>
                    <option value="Question">Low</option>
                </select>
                
                {/* On n'affiche ce filtre que si l'utilisateur est admin ou agent */}
                {user && (user.role === 'admin' || user.role === 'agent') && (
                    <select name="agent" value={filters.agent || ''} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Agents</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                )}

                <button onClick={onReset} className="flex items-center justify-center space-x-2 w-full border rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100">
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Reset</span>
                </button>
            </div>
        </div>
    );
};

export default TicketFilters;