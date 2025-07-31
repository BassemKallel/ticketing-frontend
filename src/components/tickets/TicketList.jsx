import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../ui/StatusBadge';
import ticketService from '../../services/ticketService';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

// Fonction pour générer une couleur d'avatar dynamique
const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-200 text-gray-600';
    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-green-100 text-green-600',
        'bg-purple-100 text-purple-600',
        'bg-orange-100 text-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
};

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
            toast.success(`Ticket TKT-${ticketToDelete} supprimé avec succès`);
            if (onTicketDeleted) {
                onTicketDeleted(ticketToDelete);
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du ticket:', err);
            toast.error('Erreur lors de la suppression du ticket');
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setTicketToDelete(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg">
                <p className="font-semibold text-lg">Erreur : {error}</p>
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="bg-gray-50 p-10 rounded-lg text-center text-gray-600">
                <h3 className="text-xl font-semibold">Aucun ticket à afficher</h3>
                <p className="mt-2 text-sm">Il n'y a pas de tickets correspondant à vos filtres.</p>
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Sujet</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Catégorie</th>
                                <th className="px-6 py-4">Assigné à</th>
                                <th className="px-6 py-4">Créé le</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y divide-gray-100">
                            {tickets.map((ticket) => {
                                const canDelete = user?.role === 'admin' || String(user?.id) === String(ticket.createur?.id);
                                return (
                                    <tr
                                        key={ticket.id}
                                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        onClick={() => handleTicketClick(ticket.id)}
                                        role="button"
                                        aria-label={`Voir le ticket TKT-${ticket.id}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base ${getAvatarColor(
                                                        ticket.createur?.name
                                                    )}`}
                                                >
                                                    {ticket.createur?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-800">{ticket.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        TKT-{ticket.id} • Par {ticket.createur?.name || 'Inconnu'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge type="status" value={ticket.statut} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge value={ticket.categorie} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {ticket.agent?.name || 'Non assigné'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, ticket.id)}
                                                className="p-2.5 text-gray-400 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:text-red-600 hover:bg-red-50"
                                                title={canDelete ? 'Supprimer le ticket' : 'Vous n\'avez pas la permission de supprimer ce ticket'}
                                                disabled={!canDelete}
                                                aria-label={canDelete ? `Supprimer le ticket TKT-${ticket.id}` : 'Suppression non autorisée'}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cartes pour mobile */}
            <div className="md:hidden space-y-4">
                {tickets.map((ticket) => {
                    const canDelete = user?.role === 'admin' || String(user?.id) === String(ticket.createur?.id);
                    return (
                        <div
                            key={ticket.id}
                            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleTicketClick(ticket.id)}
                            role="button"
                            aria-label={`Voir le ticket TKT-${ticket.id}`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${getAvatarColor(
                                            ticket.createur?.name
                                        )}`}
                                    >
                                        {ticket.createur?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">TKT-{ticket.id}</p>
                                        <p className="text-xs text-gray-500">{ticket.createur?.name || 'Inconnu'}</p>
                                    </div>
                                </div>
                                <StatusBadge type="status" value={ticket.statut} />
                            </div>
                            <div className="text-sm text-gray-900 font-medium mb-2">{ticket.title}</div>
                            <div className="text-sm text-gray-600 mb-1">
                                Catégorie : <StatusBadge value={ticket.categorie} />
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                                Assigné à : {ticket.agent?.name || 'Non assigné'}
                            </div>
                            <div className="text-sm text-gray-600">
                                Créé le :{' '}
                                {new Date(ticket.created_at).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={(e) => handleDeleteClick(e, ticket.id)}
                                    className="p-2.5 text-gray-400 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent hover:text-red-600 hover:bg-red-50"
                                    title={canDelete ? 'Supprimer le ticket' : 'Vous n\'avez pas la permission de supprimer ce ticket'}
                                    disabled={!canDelete}
                                    aria-label={canDelete ? `Supprimer le ticket TKT-${ticket.id}` : 'Suppression non autorisée'}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Supprimer le Ticket"
                message="Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible."
                isConfirming={isDeleting}
            />
        </>
    );
};

export default TicketList;
