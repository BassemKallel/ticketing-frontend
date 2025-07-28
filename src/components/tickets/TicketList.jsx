import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../ui/StatusBadge';
import ticketService from '../../services/ticketService';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';

const TicketList = ({ tickets, isLoading, error, onTicketDeleted }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [ticketToDelete, setTicketToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleTicketClick = (ticketId) => {
        navigate(`/tickets/${ticketId}`);
    };

    const handleDeleteClick = (e, ticketId) => {
        e.stopPropagation(); 
        setTicketToDelete(ticketId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        setIsDeleting(true);
        try {
            await ticketService.delete(ticketToDelete);
            if (onTicketDeleted) {
                onTicketDeleted(ticketToDelete);
            }
        } catch (err) {
            console.error("Erreur lors de la suppression du ticket:", err);
            // Idéalement, afficher un toast d'erreur ici
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setTicketToDelete(null);
        }
    };

    if (isLoading) {
        return <div className="text-center p-8">Chargement des tickets...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="text-gray-600 uppercase text-xs">
                                <th className="px-6 py-3 font-semibold">Sujet</th>
                                <th className="px-6 py-3 font-semibold">Statut</th>
                                <th className="px-6 py-3 font-semibold">Catégorie</th>
                                <th className="px-6 py-3 font-semibold">Assigné à</th>
                                <th className="px-6 py-3 font-semibold">Créé le</th>
                                <th className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y divide-gray-200">
                            {tickets.length > 0 ? tickets.map(ticket => {
                                const canDelete = user?.role === 'admin' || String(user?.id) === String(ticket.createur?.id);

                                return (
                                    <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center font-bold text-orange-500 text-base">
                                                    {ticket.createur?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{ticket.title}</p>
                                                    <p className="text-xs text-gray-500">TKT-{ticket.id} • Par {ticket.createur?.name || 'Inconnu'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><StatusBadge type="status" value={ticket.statut} /></td>
                                        <td className="px-6 py-4"><StatusBadge value={ticket.categorie} /></td>
                                        <td className="px-6 py-4 text-sm">{ticket.agent?.name || 'Non assigné'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={(e) => handleDeleteClick(e, ticket.id)}
                                                className="p-2 text-gray-400 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:text-red-500 hover:bg-red-100"
                                                title={canDelete ? "Supprimer le ticket" : "Vous n'avez pas la permission de supprimer ce ticket"}
                                                disabled={!canDelete}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="6" className="text-center py-16 text-gray-500">
                                    <h3 className="text-xl font-semibold">Aucun ticket à afficher</h3>
                                    <p className="mt-1">Il n'y a pas de tickets correspondant à vos filtres.</p>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer le Ticket"
                message="Êtes-vous sûr de vouloir supprimer ce ticket? Cette action est irréversible."
                isConfirming={isDeleting}
            />
        </>
    );
};

export default TicketList;
