import React, { useState, useEffect } from 'react';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';
import TicketFilters from '../components/tickets/TicketFilters';
import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const initialFilters = { search: '', status: '', priority: '' };
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const fetchMyTickets = async () => {
            try {
                const data = await ticketService.getMyTickets();
                setTickets(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMyTickets();
    }, []);

    const handleResetFilters = () => {
        setFilters(initialFilters);
    };

    // Logique de filtrage côté client pour la page "My Tickets"
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const searchLower = filters.search.toLowerCase();
            const ticketIdString = `TKT-${ticket.id}`;
            return (
                (filters.search === '' || 
                    ticket.title.toLowerCase().includes(searchLower) ||
                    ticketIdString.toLowerCase().includes(searchLower)
                ) &&
                (filters.status === '' || ticket.statut === filters.status) &&
                (filters.priority === '' || ticket.categorie === filters.priority)
            );
        });
    }, [tickets, filters]);

    const handleTicketDeleted = (deletedTicketId) => {
        setTickets(currentTickets => currentTickets.filter(ticket => ticket.id !== deletedTicketId));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Tickets</h1>
            <TicketFilters 
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
            />
            <TicketList 
                tickets={filteredTickets} 
                isLoading={isLoading} 
                error={error} 
                onTicketDeleted={handleTicketDeleted}
            />
        </div>
    );
};

export default MyTicketsPage;