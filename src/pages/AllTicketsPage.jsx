import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketList from '../components/tickets/TicketList';
import ticketService from '../services/ticketService';
import userService from '../services/userService';
import echo from '../services/echo';
import CreateTicketModal from '../components/tickets/CreateTicketModal';

const AllTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    // État pour mémoriser l'ID du ticket avec une nouvelle activité
    const [unreadTicketIds, setUnreadTicketIds] = useState(() => {
        try {
            const savedUnread = localStorage.getItem('unreadAllTickets');
            return savedUnread ? new Set(JSON.parse(savedUnread)) : new Set();
        } catch (error) {
            return new Set();
        }
    });

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
        localStorage.setItem('unreadAllTickets', JSON.stringify(Array.from(unreadTicketIds)));
    }, [unreadTicketIds]);

    // Effet pour écouter tous les événements WebSocket pertinents
    useEffect(() => {
        const channel = echo.private('team');



        // Handler pour un nouveau ticket
        const handleTicketCreated = (event) => {
            if (event.ticket?.id) {
                setTickets(prev => [event.ticket, ...prev]);
            }
        };

        // Handler pour la suppression d'un ticket
        const handleTicketDeleted = (event) => {
            if (event.ticketId) {
                setTickets(prev => prev.filter(t => t.id !== event.ticketId));
            }
        };

        const handleTicketActivity = (event) => {
            const ticket = event.ticket;
            let ticketIdToUpdate = null;

            if (ticket?.id) {
                ticketIdToUpdate = ticket.id;
                setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, ...ticket } : t));
            }

            if (ticketIdToUpdate) {
                setUnreadTicketIds(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.add(ticketIdToUpdate);
                    return newSet;
                });
            }
        };

        channel
            .listen('.ticket.cree', handleTicketCreated)
            .listen('.ticket.supprime', handleTicketDeleted)
            .listen('.ticket.mis_a_jour', handleTicketActivity)
            .listen('.commentaire.ajoute', handleTicketActivity)
            .listen('.piecejointe.ajoutee', handleTicketActivity);

        return () => {
            channel
                .stopListening('.ticket.cree', handleTicketCreated)
                .stopListening('.ticket.supprime', handleTicketDeleted)
                .stopListening('.ticket.mis_a_jour', handleTicketActivity)
                .stopListening('.commentaire.ajoute', handleTicketActivity)
                .stopListening('.piecejointe.ajoutee', handleTicketActivity);
            echo.leave('team');
        };
    }, []);

    const handleResetFilters = () => {
        setFilters(initialFilters);
    };

    const handleNewTicketSuccess = (newTicket) => {
        setTickets(prev => [newTicket, ...prev]);
    };

    const handleTicketViewed = useCallback((ticketId) => {
        setUnreadTicketIds(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(ticketId);
            return newSet;
        });
    }, []);

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
        <div className='container mx-auto p-4 sm:p-6 lg:p-8'>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Tous les tickets</h1>
            </div>
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
                onTicketDeleted={(ticketId) => setTickets(prev => prev.filter(t => t.id !== ticketId))}
                onTicketViewed={handleTicketViewed}
                unreadTicketIds={unreadTicketIds}
            />
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleNewTicketSuccess}
            />
        </div>
    );
};

export default AllTicketsPage;
