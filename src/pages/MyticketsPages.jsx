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
    const initialFilters = { search: '', status: '', priority: '', agent: '' };
    const [filters, setFilters] = useState(initialFilters);
    const { user } = useAuth();
    const [unreadTicketIds, setUnreadTicketIds] = useState(() => {
        try {
            const savedUnread = localStorage.getItem('unreadMyTickets');
            return savedUnread ? new Set(JSON.parse(savedUnread)) : new Set();
        } catch (error) {
            return new Set();
        }
    });

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

    useEffect(() => {
        localStorage.setItem('unreadMyTickets', JSON.stringify(Array.from(unreadTicketIds)));
    }, [unreadTicketIds]);

    // --- CORRECTION 1 : La fonction de succès se contente de fermer la modale ---
    // On laisse le WebSocket gérer l'ajout à la liste.
    const handleCreateSuccess = useCallback(() => {
        setModalOpen(false);
        toast.success("Votre ticket a été soumis avec succès !");
    }, []);

    const handleTicketCreated = useCallback((data) => {
        const newTicket = data.ticket || data;
        // On vérifie si le ticket concerne bien l'utilisateur actuel
        if (newTicket?.user_id === user.id) {
            setTickets(prev => {
                // On s'assure de ne pas l'ajouter s'il est déjà là (sécurité supplémentaire)
                if (prev.some(t => t.id === newTicket.id)) return prev;
                return [newTicket, ...prev];
            });
        }
    }, [user?.id]);

    const handleTicketUpdated = useCallback((event) => {
        const updatedTicket = event.ticket || event;
        if (!updatedTicket?.id) return;

        const isRelevant = tickets.some(t => t.id === updatedTicket.id);
        if (!isRelevant) return;

        setTickets(prevTickets =>
            prevTickets.map(t => t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)
        );

        setUnreadTicketIds(prevSet => {
            const newSet = new Set(prevSet);
            newSet.add(updatedTicket.id);
            return newSet;
        });

        toast.info(`Activité sur votre ticket #${updatedTicket.id}.`);
    }, [user?.id, tickets]); // `tickets` est ajouté comme dépendance

    const handleTicketDeleted = useCallback((data) => {
        const ticketId = data.ticketId || data;
        if (!ticketId) return;
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        toast.info(`Le ticket #${ticketId} a été supprimé.`);
    }, []);

    useEffect(() => {
        if (user?.id) fetchMyTickets();
    }, [user?.id, fetchMyTickets]);

    useEffect(() => {
        if (!user?.id) return;
        
        // On écoute sur le canal de l'utilisateur et sur le canal de l'équipe si c'est un agent/admin
        const userChannel = echo.private(`App.Models.User.${user.id}`);
        userChannel
            .listen('.ticket.cree', handleTicketCreated)
            .listen('.ticket.mis_a_jour', handleTicketUpdated)
            .listen('.ticket.supprime', handleTicketDeleted);

        let teamChannel;
        if (['agent', 'admin'].includes(user.role)) {
            teamChannel = echo.private('team');
            teamChannel.listen('.ticket.cree', handleTicketCreated);
        }

        return () => {
            echo.leave(`App.Models.User.${user.id}`);
            if (teamChannel) {
                echo.leave('team');
            }
        };
    }, [user?.id, user?.role, handleTicketCreated, handleTicketUpdated, handleTicketDeleted]);

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
        <div>
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
                onTicketDeleted={handleTicketDeleted}
                onTicketViewed={handleTicketViewed}
                unreadTicketIds={unreadTicketIds}
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
