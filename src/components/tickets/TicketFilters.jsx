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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                
                {/* Champ de recherche */}
                <div className="relative md:col-span-2">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        name="search" 
                        value={filters.search || ''} 
                        onChange={handleInputChange} 
                        placeholder="Rechercher par ID, sujet..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg transition-colors focus:ring-2 focus:ring-orange-400 focus:border-orange-500" 
                    />
                </div>
                
                {/* Filtre par statut */}
                <select 
                    name="status" 
                    value={filters.status || ''} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
                >
                    <option value="">Tous les statuts</option>
                    <option value="Ouvert">Ouvert</option>
                    <option value="En_cours">En cours</option>
                    <option value="Resolu">Résolu</option>
                    <option value="Fermé">Fermé</option>
                </select>
                
                {/* Filtre par priorité */}
                <select 
                    name="priority" 
                    value={filters.priority || ''} 
                    onChange={handleInputChange} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
                >
                    <option value="">Toutes les categories</option>
                    <option value="Bloquage">Blouqant</option>
                    <option value="Demande">Demande</option>
                    <option value="Question">Question</option>
                </select>
                
                {/* Filtre par agent (visible pour admin/agent) */}
                {user && (user.role === 'admin' || user.role === 'agent') && (
                    <select 
                        name="agent" 
                        value={filters.agent || ''} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
                    >
                        <option value="">Tous les agents</option>
                        {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                    </select>
                )}

                {/* Bouton Reset */}
                <button 
                    onClick={onReset} 
                    className="flex items-center justify-center space-x-2 w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Réinitialiser</span>
                </button>
            </div>
        </div>
    );
};

export default TicketFilters;
