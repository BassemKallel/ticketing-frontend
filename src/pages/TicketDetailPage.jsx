import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PaperAirplaneIcon, TicketIcon, StarIcon, ClockIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../components/ui/StatusBadge';
import ticketService from '../services/ticketService';
import commentaireService from '../services/commentaireService';
import userService from '../services/userService';
import pieceJointeService from '../services/pieceJointeService';
import AssignTicketModal from '../components/tickets/AssignTicketModal';
import ChangeStatusModal from '../components/tickets/ChangeStatusModal';
import ConfirmationModal from '../components/tickets/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';
// Importation des composants pour la conversation
import ChatMessage from '../components/tickets/ChatMessage';
import AttachmentMessage from '../components/tickets/AttachmentMessage';

const TicketDetailPage = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [newFile, setNewFile] = useState(null);
    const { user } = useAuth();

    // États pour les modales
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    const fetchTicket = async () => {
        try {
            const data = await ticketService.getById(id);
            console.log(data);
            setTicket(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchAgents = async () => {
            if (user?.role === 'admin' || user?.role === 'agent') {
                try {
                    const agentsData = await userService.getAgents();
                    setAgents(agentsData);
                } catch (err) {
                    console.error("Failed to fetch agents", err);
                }
            }
        };

        fetchAgents().then(() => {
            fetchTicket();
        });
    }, [id, user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && !newFile) return;

        const promises = [];
        if (newComment.trim()) {
            promises.push(commentaireService.create(id, { contenu: newComment }));
        }
        if (newFile) {
            const formData = new FormData();
            formData.append('fichier', newFile);
            promises.push(pieceJointeService.create(id, formData));
        }

        try {
            await Promise.all(promises);
        } catch (err) {
            console.error("Failed to post update:", err);
            setError("Impossible d'envoyer votre réponse. Veuillez réessayer.");
        } finally {
            setNewComment('');
            setNewFile(null);
            fetchTicket();
        }
    };

    const handleDeleteRequest = (type, id) => {
        setItemToDelete({ type, id });
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { type, id } = itemToDelete;
        try {
            if (type === 'commentaire') {
                await commentaireService.delete(id);
                setTicket(prev => ({ ...prev, commentaires: prev.commentaires.filter(c => c.id !== id) }));
            } else if (type === 'pièce jointe') {
                await pieceJointeService.delete(id);
                setTicket(prev => ({ ...prev, pieces_jointes: prev.pieces_jointes.filter(pj => pj.id !== id) }));
            }
        } catch (err) {
            console.error(`Failed to delete ${type}:`, err);
            setError(`Erreur lors de la suppression. Veuillez réessayer.`);
        } finally {
            setItemToDelete(null);
        }
    };

    const conversation = useMemo(() => {
        if (!ticket) return [];
        const descriptionMessage = {
            id: `desc-${ticket.id}`, type: 'commentaire', contenu: ticket.description,
            auteur: ticket.createur, created_at: ticket.created_at,
        };
        const comments = (ticket.commentaires || []).map(c => ({ ...c, type: 'commentaire' }));
        const attachments = (ticket.pieces_jointes || []).map(pj => ({ ...pj, type: 'pièce jointe', auteur: pj.user }));
        return [descriptionMessage, ...comments, ...attachments]
            .filter(item => item && item.auteur)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }, [ticket]);

    if (isLoading) return <div className="text-center p-8">Chargement du ticket...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!ticket) return null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contenu principal */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800">{ticket.title}</h2>
                        <p className="text-sm text-gray-500 mt-1">TKT-{ticket.id} • Créé le {new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md flex-grow flex flex-col">
                        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-4">
                            {conversation.map((item) => {
                                const uniqueKey = `${item.type}-${item.id}`;
                                if (item.type === 'commentaire') {
                                    return (
                                        <ChatMessage
                                            key={uniqueKey}
                                            message={item}
                                            currentUser={user}
                                            agents={agents}
                                            onDeleteRequest={handleDeleteRequest}
                                        />
                                    );
                                }
                                if (item.type === 'pièce jointe') {
                                    return (
                                        <AttachmentMessage
                                            key={uniqueKey}
                                            attachment={item}
                                            currentUser={user}
                                            agents={agents}
                                            onDeleteRequest={handleDeleteRequest}
                                        />
                                    );
                                }
                                return null;
                            })}
                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <form onSubmit={handleFormSubmit}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full border-gray-200 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                                placeholder="Écrivez votre réponse ici..."
                            ></textarea>
                            {newFile && (
                                <div className="mt-2 text-sm text-green-600">
                                    Fichier joint : {newFile.name}
                                    <button type="button" onClick={() => setNewFile(null)} className="ml-2 text-red-500 font-bold">X</button>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                    <PaperClipIcon className="h-6 w-6" />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={(e) => setNewFile(e.target.files[0])} className="hidden" />
                                <button type="submit" className="bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-600 flex items-center">
                                    Envoyer
                                    <PaperAirplaneIcon className="h-5 w-5 ml-2 -rotate-45" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Barre latérale */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-gray-800 text-lg">Informations du Ticket</h3>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Statut</p>
                            <div className="flex justify-between items-center mt-1">
                                <StatusBadge type="status" value={ticket.statut} />
                                {
                                    (user?.id === ticket.agent_id || user?.role === 'admin') 
                                    && (<button onClick={() => setStatusModalOpen(true)} className="text-sm text-blue-500 font-semibold hover:underline">Changer</button>)
                                }
                                
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4 space-y-3 text-sm">
                            <div className="flex items-center"><TicketIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">ID:</span><span className="font-semibold text-gray-800 ml-2">TKT-{ticket.id}</span></div>
                            <div className="flex items-center"><StarIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Priorité:</span><span className="font-semibold text-red-500 ml-2">{ticket.categorie}</span></div>
                            <div className="flex items-center"><ClockIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Mise à jour:</span><span className="font-semibold text-gray-800 ml-2">{new Date(ticket.updated_at).toLocaleDateString()}</span></div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <p className="text-sm text-gray-500">Assigné à</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="font-semibold text-gray-800">{ticket.agent?.name || 'Non assigné'}</span>
                                {
                                    user?.role === 'admin' && (<button onClick={() => setAssignModalOpen(true)} className="text-sm text-blue-500 font-semibold hover:underline">Assigner</button>)
                                }
                                
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <p className="text-sm text-gray-500">Créé par</p>
                            <div className="flex items-center mt-2">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">{ticket.createur?.name?.charAt(0) || '?'}</div>
                                <div className="ml-3">
                                    <p className="font-semibold text-gray-800">{ticket.createur?.name || "Inconnu"}</p>
                                    <p className="text-xs text-gray-500">Créé le {new Date(ticket.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Fermer le Ticket</button>
                        <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Imprimer le Ticket</button>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <AssignTicketModal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} ticketId={ticket.id} agents={agents} onSuccess={fetchTicket} />
            <ChangeStatusModal isOpen={isStatusModalOpen} onClose={() => setStatusModalOpen(false)} ticket={ticket} onSuccess={fetchTicket} />
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title={`Supprimer l'élément`}
                message={`Êtes-vous sûr de vouloir supprimer ce ${itemToDelete?.type} ? Cette action est irréversible.`}
            />
        </>
    );
};

export default TicketDetailPage;
