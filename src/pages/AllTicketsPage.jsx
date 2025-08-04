import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';
import userService from '../services/userService';
import echo from '../services/echo';

const AllTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const initialFilters = {
        search: '',
        status: '',
        priority: '',
        agent: ''
    };
    const [filters, setFilters] = useState(initialFilters);

    // Effet pour charger les données initiales
    useEffect(() => {
        const loadData = async () => {
            try {
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

    useEffect(() => {
        const channel = echo.private('team');

        channel.error((error) => {
            console.error('Erreur WebSocket team:', error);
            toast.error('Erreur de connexion WebSocket');
        });

        // Création
        channel.listen('.ticket.cree', (event) => {
            if (event.ticket?.id) {
                const newTicket = {
                    ...event.ticket,
                    statut: event.ticket.statut || '',
                    categorie: event.ticket.categorie || '',
                    agent_id: event.ticket.agent_id || null,
                    createur: event.ticket.createur ? {
                        id: event.ticket.createur.id,
                        name: event.ticket.createur.name
                    } : null,
                    agent: event.ticket.agent ? {
                        id: event.ticket.agent.id,
                        name: event.ticket.agent.name
                    } : null
                };
                setTickets(prev => [newTicket, ...prev]);
                toast.success(`Nouveau ticket #${newTicket.id}`);
            }
        });

        channel.listen('.ticket.mis_a_jour', (event) => {
            console.log('TicketMisAJour reçu:', event);

            if (event.ticket?.id) {
                const updatedTicket = {
                    ...event.ticket,
                    statut: event.ticket.statut,
                    categorie: event.ticket.categorie,
                    agent_id: event.ticket.agent_id,
                    createur: event.ticket.createur,
                    agent: event.ticket.agent
                };

                setTickets(prevTickets =>
                    prevTickets.map(t =>
                        t.id === updatedTicket.id ? updatedTicket : t
                    )
                );

                toast.success(`Ticket #${updatedTicket.id} mis à jour`);
            }
        });

        channel.listen('.ticket.supprime', (event) => {
            if (event.ticketId) {
                setTickets(prev => prev.filter(t => t.id !== event.ticketId));
            }
        });

        return () => {
            channel.stopListening('.ticket.cree');
            channel.stopListening('.ticket.mis_a_jour');
            channel.stopListening('.ticket.supprime');
            echo.leave('team');
        };
    }, []);
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
        <div>
            <h1 className="text-3xl font-bold mb-4">Tous les tickets</h1>
            <TicketFilters
                filters={filters}
                setFilters={setFilters}
                agents={agents}
                onReset={handleResetFilters}
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
