import React, { useState, useEffect } from 'react';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';
import userService from '../services/userService';

const AllTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]); // Nouvel état pour les agents
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const initialFilters = {
        search: '',
        status: '',
        priority: '',
        agent: '' // Ajout du filtre agent
    };
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const loadData = async () => {
            try {
                // On charge les tickets et les agents en parallèle
                const [ticketsData, agentsData] = await Promise.all([
                    ticketService.getAll(),
                    userService.getAgents()
                ]);
                setTickets(ticketsData);
                setAgents(agentsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Fonction pour réinitialiser les filtres
    const handleResetFilters = () => {
        setFilters(initialFilters);
    };

    const filteredTickets = tickets.filter(ticket =>
        (filters.search === '' ||
            ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            `TKT-${ticket.id}`.toLowerCase().includes(filters.search.toLowerCase())
        ) &&
        (filters.status === '' || ticket.statut === filters.status) &&
        (filters.priority === '' || ticket.categorie === filters.priority) &&
        (filters.agent === '' || ticket.agent_id === parseInt(filters.agent))
    );

    return (
        <div className='container mx-auto p-2 max-w-7xl'>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">All Tickets</h1>
            <TicketFilters
                filters={filters}
                setFilters={setFilters}
                agents={agents} // On passe la liste des agents au composant de filtres
                onReset={handleResetFilters} // On passe la fonction de reset
            />
            <TicketList
                tickets={filteredTickets}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
};

export default AllTicketsPage;