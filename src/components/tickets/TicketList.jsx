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
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <th className="px-4 py-3">Ticket ID</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3">Created By</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Categorie</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Created</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {tickets.length > 0 ? tickets.map(ticket => {
                                const canDelete = user?.role === 'admin' || String(user?.id) === String(ticket.createur?.id);

                                return (
                                    <tr key={ticket.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                                        <td className="px-4 py-4 font-semibold text-gray-800">TKT-{ticket.id}</td>
                                        <td className="px-4 py-4">{ticket.title}</td>
                                        <td className="px-4 py-4">{ticket.createur?.name || 'Inconnu'}</td>
                                        <td className="px-4 py-4"><StatusBadge type="status" value={ticket.statut} /></td>
                                        <td className="px-4 py-4"><StatusBadge value={ticket.categorie} /></td>
                                        <td className="px-4 py-4">{ticket.agent?.name || 'Unassigned'}</td>
                                        <td className="px-4 py-4 text-gray-600">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            {/* Le bouton est toujours visible, mais désactivé si l'utilisateur n'a pas la permission */}
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
                                <tr><td colSpan="8" className="text-center py-8 text-gray-500">Aucun ticket à afficher.</td></tr>
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
