import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import TicketList from '../components/tickets/TicketList';
import TicketFilters from '../components/tickets/TicketFilters';
import CreateTicketModal from '../components/tickets/CreateTicketModal';
import ticketService from '../services/ticketService';
import { useAuth } from '../hooks/useAuth';
import echo from '../services/echo';

const MyTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    
    const [unreadTicketIds, setUnreadTicketIds] = useState(() => {
        try {
            const savedUnread = localStorage.getItem('unreadMyTickets');
            return savedUnread ? new Set(JSON.parse(savedUnread)) : new Set();
        } catch (error) {
            return new Set();
        }
    });

    const initialFilters = { search: '', status: '', priority: '' };
    const [filters, setFilters] = useState(initialFilters);
    const { user } = useAuth();

    const fetchMyTickets = useCallback(async () => {
        if (!user?.id) return;
        try {
            setIsLoading(true);
            setError(null);
            const data = await ticketService.getMyTickets();
            setTickets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        localStorage.setItem('unreadMyTickets', JSON.stringify(Array.from(unreadTicketIds)));
    }, [unreadTicketIds]);

    useEffect(() => {
        if (user?.id) {
            fetchMyTickets();
        }
    }, [user?.id, fetchMyTickets]);

    useEffect(() => {
        if (!user?.id) return;

        const handleTicketCreated = (event) => {
            const newTicket = event.ticket;
            if (newTicket && (String(newTicket.user_id) === String(user.id))) {
                setTickets(prev => [newTicket, ...prev]);
            }
        };

        const handleTicketDeleted = (event) => {
            const { ticketId } = event;
            if (ticketId) {
                setTickets(prev => prev.filter(t => t.id !== ticketId));
            }
        };

        const handleTicketUpdated = (event) => {
            const updatedTicket = event.ticket;
            if (updatedTicket && tickets.some(t => t.id === updatedTicket.id)) {
                setTickets(prev => prev.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t));
                setUnreadTicketIds(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.add(updatedTicket.id);
                    return newSet;
                });
            }
        };

        // --- CORRECTION : On écoute maintenant sur les bons canaux et les bons événements ---
        let userChannel = echo.private(`App.Models.User.${user.id}`);
        userChannel
            .listen('.ticket.cree', handleTicketCreated)
            .listen('.ticket.supprime', handleTicketDeleted) // Le client écoute la suppression
            .listen('.ticket.mis_a_jour', handleTicketUpdated);

        if (user.role === 'agent' || user.role === 'admin') {
            let teamChannel = echo.private('team');
            teamChannel
                .listen('.ticket.cree', handleTicketCreated)
                .listen('.ticket.supprime', handleTicketDeleted);
        }

        return () => {
            echo.leave(`App.Models.User.${user.id}`);
            if (user.role === 'agent' || user.role === 'admin') {
                echo.leave('team');
            }
        };
    }, [user?.id, user?.role, tickets]);

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
        (filters.priority === '' || ticket.categorie === filters.priority)
    );

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col mb-10 sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Mes tickets</h1>
                {user?.role === 'client' && (
                    <button
                        onClick={() => setModalOpen(true)}
                        className="bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-300 transition-colors"
                    >
                        Créer un ticket
                    </button>
                )}
            </div>
            <div className="bg-white rounded-lg shadow mb-6">
                <TicketFilters
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>
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
                onSuccess={(newTicket) => setTickets(prev => [newTicket, ...prev])}
            />
        </div>
    );
};

export default MyTicketsPage;
