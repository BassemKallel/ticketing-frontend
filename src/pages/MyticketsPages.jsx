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
    const [newlyUpdatedTicketId, setNewlyUpdatedTicketId] = useState(null); // <-- L'état est ici
    const initialFilters = { search: '', status: '', priority: '', agent: '' };
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
            console.error('Erreur lors du chargement des tickets:', err);
            setError(err.message);
            toast.error("Erreur lors du chargement de vos tickets.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    const handleTicketCreated = useCallback((data) => {
        const newTicket = data.ticket || data;
        if (!newTicket?.id || (newTicket.user_id !== user.id && newTicket.agent_id !== user.id)) return;
        setTickets(prev => {
            if (prev.some(t => t.id === newTicket.id)) return prev;
            return [newTicket, ...prev];
        });
        if (newTicket.user_id === user?.id) {
            toast.success(`Votre ticket #${newTicket.id} a été créé avec succès.`);
        } else if (['admin', 'agent'].includes(user?.role)) {
            toast.info(`Nouveau ticket #${newTicket.id} créé par ${newTicket.createur?.name || 'un utilisateur'}.`);
        }
    }, [user?.id, user?.role]);

    const handleTicketUpdated = useCallback((event) => {
        const updatedTicket = event.ticket || event;
        if (!updatedTicket?.id || (updatedTicket.user_id !== user.id && updatedTicket.agent_id !== user.id)) return;
        setTickets(prevTickets =>
            prevTickets.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)
        );
        setNewlyUpdatedTicketId(updatedTicket.id); // <-- Appel correct
        if (updatedTicket.user_id === user?.id) {
            toast.info(`Votre ticket #${updatedTicket.id} a été mis à jour.`);
        } else if (['admin', 'agent'].includes(user?.role)) {
            toast.info(`Le ticket #${updatedTicket.id} a été mis à jour.`);
        }
    }, [user?.id, user?.role]);

    const handleTicketDeleted = useCallback((data) => {
        const ticketId = data.ticketId || data;
        if (!ticketId) return;
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        toast.info(`Le ticket #${ticketId} a été supprimé.`);
    }, []);

    const handleNotification = useCallback(() => {
        fetchMyTickets();
    }, [fetchMyTickets]);

    const handleCreateSuccess = useCallback((newTicket) => {
        setModalOpen(false);
        setTickets(prev => {
            if (prev.some(t => t.id === newTicket.id)) return prev;
            return [newTicket, ...prev];
        });
        toast.success(`Votre ticket #${newTicket.id} a été créé avec succès.`);
    }, []);

    const handleTicketViewed = useCallback(() => {
        setNewlyUpdatedTicketId(null); // <-- La fonction de rappel pour le composant enfant
    }, []);

    useEffect(() => {
        if (user?.id) fetchMyTickets();
    }, [user?.id, fetchMyTickets]);

    useEffect(() => {
        if (!user?.id) return;
        let channels = [];
        try {
            if (user.role === 'client') {
                const userChannelName = `App.Models.User.${user.id}`;
                const userChannel = echo.private(userChannelName);
                userChannel.listen('.notification.nouvelle', handleNotification);
                userChannel.listen('.ticket.mis_a_jour', handleTicketUpdated);
                channels.push(userChannelName);
            } else if (['agent', 'admin'].includes(user.role)) {
                const teamChannelName = 'team';
                const teamChannel = echo.private(teamChannelName);
                teamChannel
                    .listen('.ticket.cree', handleTicketCreated)
                    .listen('.ticket.mis_a_jour', handleTicketUpdated)
                    .listen('.ticket.supprime', handleTicketDeleted);
                channels.push(teamChannelName);
            }
        } catch (error) {
            console.error('[WebSocket] Erreur de connexion:', error);
        }
        return () => {
            channels.forEach(channelName => echo.leave(channelName));
        };
    }, [user?.id, user?.role, handleTicketCreated, handleTicketUpdated, handleTicketDeleted, handleNotification]);

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
                    allTickets={tickets}
                    onFilter={setTickets}
                    filters={filters}
                    setFilters={setFilters}
                />
            </div>
            <TicketList
                tickets={filteredTickets}
                isLoading={isLoading}
                error={error}
                onTicketDeleted={handleTicketDeleted}
                onTicketViewed={handleTicketViewed} // <-- Passage de la fonction de rappel ici
                newlyUpdatedTicketId={newlyUpdatedTicketId}
            />
            <CreateTicketModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default MyTicketsPage;