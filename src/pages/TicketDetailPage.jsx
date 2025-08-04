import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PaperAirplaneIcon, TicketIcon, StarIcon, ClockIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Services & Hooks
import ticketService from '../services/ticketService';
import commentaireService from '../services/commentaireService';
import userService from '../services/userService';
import pieceJointeService from '../services/pieceJointeService';
import echo from '../services/echo';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';

// Composants
import StatusBadge from '../components/ui/StatusBadge';
import AssignTicketModal from '../components/tickets/AssignTicketModal';
import ChangeStatusModal from '../components/tickets/ChangeStatusModal';
import ConfirmationModal from '../components/tickets/ConfirmationModal';
import ChatMessage from '../components/tickets/ChatMessage';
import AttachmentMessage from '../components/tickets/AttachmentMessage';

const TicketDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { markTicketAsRead } = useNotifications();

    // États
    const [ticket, setTicket] = useState(null);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [newFile, setNewFile] = useState(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Références
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);

    const fetchTicket = useCallback(async () => {
        try {
            const ticketData = await ticketService.getById(id, { include: ['commentaires.auteur', 'pieces_jointes.user'] });
            setTicket(ticketData);
        } catch (err) {
            setError(err.message);
            toast.error("Erreur lors du chargement du ticket.");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                if (user?.role === 'admin' || user?.role === 'agent') {
                    const agentsData = await userService.getAgents();
                    setAgents(agentsData);
                }
                await fetchTicket();
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchInitialData();
    }, [id, user, fetchTicket]);

    // Marque le ticket comme lu lors de l'ouverture de la page
    useEffect(() => {
        if (id) {
            markTicketAsRead(parseInt(id, 10));
        }
    }, [id, markTicketAsRead]);

    // --- LOGIQUE WEBSOCKET POUR LA PAGE ENTIÈRE ---
    useEffect(() => {
        if (!id || !user) return;

        console.log(`[WebSocket] Connexion au canal du ticket : ticket.${id}`);
        const channel = echo.private(`ticket.${id}`);

        const handleCommentAdded = (event) => {
            console.log('[WebSocket] Événement reçu: commentaire.ajoute', event);
            if (event.commentaire?.auteur?.id === user.id) return;
            const updatedComment = {
                ...event.commentaire,
                created_at: event.commentaire?.created_at ? new Date(event.commentaire.created_at).toISOString() : new Date().toISOString()
            };
            setTicket(prev => {
                if (prev && !prev.commentaires.some(c => c.id === updatedComment.id)) {
                    return { ...prev, commentaires: [...prev.commentaires, updatedComment] };
                }
                return prev;
            });
        };

        // Écouteur pour la SUPPRESSION d'un commentaire
        const handleCommentDeleted = (event) => {
            console.log('[WebSocket] Événement reçu: commentaire.supprime', event);
            setTicket(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    commentaires: prev.commentaires.filter(c => c.id !== event.commentaireId)
                }
            });
        };

        const handleAttachmentAdded = (event) => {
            console.log('[WebSocket] Événement reçu: piecejointe.ajoutee', event);
            if (!event.pieceJointe && !event.piece_jointe || (event.pieceJointe?.user?.id === user.id || event.piece_jointe?.user?.id === user.id)) return;
            const pieceJointe = event.pieceJointe || event.piece_jointe;
            const updatedPieceJointe = {
                ...pieceJointe,
                created_at: pieceJointe?.created_at ? new Date(pieceJointe.created_at).toISOString() : new Date().toISOString()
            };
            setTicket(prev => {
                if (!prev) return prev;
                const existingPieces = prev.pieces_jointes || [];
                if (!existingPieces.some(pj => pj.id === updatedPieceJointe.id)) {
                    return { ...prev, pieces_jointes: [...existingPieces, updatedPieceJointe] };
                }
                return prev;
            });
        };

        // Écouteur pour la SUPPRESSION d'une pièce jointe
        const handleAttachmentDeleted = (event) => {
            console.log('[WebSocket] Événement reçu: piecejointe.supprimee', event);
            setTicket(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    pieces_jointes: prev.pieces_jointes.filter(pj => pj.id !== event.pieceJointeId)
                }
            });
        };

        // Écouteur pour la MISE À JOUR générale du ticket (statut, agent)
        const handleTicketUpdated = (event) => {
            console.log('[WebSocket] Événement reçu: ticket.mis_a_jour', event);
            toast.info(`Le ticket #${event.ticket.id} a été mis à jour.`);
            setTicket(prev => ({ ...prev, ...event.ticket }));
        };

        // On attache tous les écouteurs
        channel
            .listen('.commentaire.ajoute', handleCommentAdded)
            .listen('.commentaire.supprime', handleCommentDeleted)
            .listen('.piecejointe.ajoutee', handleAttachmentAdded)
            .listen('.piecejointe.supprimee', handleAttachmentDeleted)
            .listen('.ticket.mis_a_jour', handleTicketUpdated);

        // Fonction de nettoyage pour se désabonner
        return () => {
            console.log(`[WebSocket] Déconnexion du canal du ticket : ticket.${id}`);
            channel
                .stopListening('.commentaire.ajoute', handleCommentAdded)
                .stopListening('.commentaire.supprime', handleCommentDeleted)
                .stopListening('.piecejointe.ajoutee', handleAttachmentAdded)
                .stopListening('.piecejointe.supprimee', handleAttachmentDeleted)
                .stopListening('.ticket.mis_a_jour', handleTicketUpdated);
            echo.leave(`ticket.${id}`);
        };
    }, [id, user]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log('Ticket mis à jour:', ticket);
    }, [ticket]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() && !newFile) return;
        const submittingToast = toast.loading("Envoi de la réponse...");
        try {
            if (newComment.trim()) {
                const response = await commentaireService.create(id, { contenu: newComment });
                // Mise à jour optimiste pour l'expéditeur
                setTicket(prev => ({ ...prev, commentaires: [...prev.commentaires, response.commentaire] }));
            }
            if (newFile) {
                const formData = new FormData();
                formData.append('fichier', newFile);
                const response = await pieceJointeService.create(id, formData);
                // Mise à jour optimiste pour l'expéditeur
                setTicket(prev => ({ ...prev, pieces_jointes: [...prev.pieces_jointes, response.piece_jointe] }));
            }
            toast.update(submittingToast, { render: "Réponse envoyée !", type: "success", isLoading: false, autoClose: 3000 });
            setNewComment('');
            setNewFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Impossible d'envoyer.";
            toast.update(submittingToast, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
        }
    };

    const handleDeleteRequest = (type, id) => setItemToDelete({ type, id });

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        const { type, id: itemId } = itemToDelete;
        const deletingToast = toast.loading("Suppression en cours...");
        try {
            let response;
            if (type === 'commentaire') {
                response = await commentaireService.delete(itemId);
                // La mise à jour de l'UI se fera via WebSocket pour tous les utilisateurs
            } else if (type === 'pièce jointe') {
                response = await pieceJointeService.delete(itemId);
                // La mise à jour de l'UI se fera via WebSocket pour tous les utilisateurs
            }
            toast.update(deletingToast, { render: response?.message || "Élément supprimé !", type: "success", isLoading: false, autoClose: 3000 });
        } catch (err) {
            console.error("Erreur lors de la suppression :", err);
            const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
            toast.update(deletingToast, { render: errorMessage, type: "error", isLoading: false, autoClose: 5000 });
        } finally {
            setItemToDelete(null);
        }
    };

    const conversation = useMemo(() => {
        if (!ticket) return [];
        const description = {
            id: `desc-${ticket.id}`, type: 'commentaire', contenu: ticket.description,
            auteur: ticket.createur, created_at: ticket.created_at, isDescription: true
        };
        const comments = (ticket.commentaires || []).map(c => ({ ...c, type: 'commentaire' }));
        const attachments = (ticket.pieces_jointes || []).map(pj => ({ ...pj, type: 'pièce jointe', auteur: pj.user }));
        return [description, ...comments, ...attachments]
            .filter(item => item && item.auteur && item.created_at)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }, [ticket]);

    if (isLoading) return <div className="text-center p-8">Chargement du ticket...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!ticket) return null;

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Le JSX reste identique */}
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
                                    return <ChatMessage key={uniqueKey} message={item} currentUser={user} onDeleteRequest={handleDeleteRequest} />;
                                }
                                if (item.type === 'pièce jointe') {
                                    return <AttachmentMessage key={uniqueKey} attachment={item} currentUser={user} onDeleteRequest={handleDeleteRequest} />;
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
                                className="w-full border-gray-200 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
                                rows="3"
                                placeholder="Écrivez votre réponse ici..."
                            />
                            {newFile && (
                                <div className="mt-2 text-sm text-green-600">
                                    Fichier joint : {newFile.name}
                                    <button type="button" onClick={() => { setNewFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-2 text-red-500 font-bold">X</button>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-2 pt-2 border-t">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                    <PaperClipIcon className="h-6 w-6" />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={(e) => setNewFile(e.target.files[0])} className="hidden" />
                                <button type="submit" className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-600 flex items-center">
                                    Envoyer
                                    <PaperAirplaneIcon className="h-5 w-5 ml-2 -rotate-45" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="font-bold text-gray-800 text-lg">Informations du Ticket</h3>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Statut</p>
                            <div className="flex justify-between items-center mt-1">
                                <StatusBadge type="status" value={ticket.statut} />
                                {(user?.id === ticket.agent_id || user?.role === 'admin') &&
                                    (<button onClick={() => setStatusModalOpen(true)} className="text-sm text-blue-600 font-semibold hover:underline">Changer</button>)
                                }
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4 space-y-3 text-sm">
                            <div className="flex items-center"><TicketIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">ID:</span><span className="font-semibold text-gray-800 ml-2">TKT-{ticket.id}</span></div>
                            <div className="flex items-center"><StarIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Categorie:</span><span className="font-semibold text-red-500 ml-2">{ticket.categorie}</span></div>
                            <div className="flex items-center"><ClockIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Mise à jour:</span><span className="font-semibold text-gray-800 ml-2">{new Date(ticket.updated_at).toLocaleDateString()}</span></div>
                        </div>
                        <div className="mt-4 border-t pt-4">
                            <p className="text-sm text-gray-500">Assigné à</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="font-semibold text-gray-800">{ticket.agent?.name || 'Non assigné'}</span>
                                {user?.role === 'admin' &&
                                    (<button onClick={() => setAssignModalOpen(true)} className="text-sm text-blue-600 font-semibold hover:underline">Assigner</button>)
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
