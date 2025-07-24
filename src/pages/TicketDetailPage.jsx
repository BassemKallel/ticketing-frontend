import React from 'react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PaperClipIcon, PaperAirplaneIcon, TicketIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../components/ui/StatusBadge';
import ticketService from '../services/ticketService';
import commentaireService from '../services/commentaireService';
import { useAuth } from '../hooks/useAuth';

const TicketDetailPage = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const data = await ticketService.getById(id);
                setTicket(data);
                console.log("Fetched ticket:", data); 
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            const createdComment = await commentaireService.create(id, { contenu: newComment });
            setTicket(prevTicket => ({
                ...prevTicket,
                commentaires: [...prevTicket.commentaires, createdComment.commentaire]
            }));
            setNewComment('');
        } catch (err) {
            console.error("Failed to post comment:", err);
        }
    };

    if (isLoading) return <div className="text-center p-8">Chargement du ticket...</div>;
    if (error) return <div className="text-center p-8 text-red-500">Erreur: {error}</div>;
    if (!ticket) return null;

    // On combine la description initiale avec les commentaires pour former une conversation complète
    const conversation = [
        {
            id: `ticket-${ticket.id}-desc`, // Clé unique pour la description
            contenu: ticket.description,
            auteur: ticket.createur,
            created_at: ticket.created_at,
        },
        ...ticket.commentaires,
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800">{ticket.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">TKT-{ticket.id} • Created on {new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md flex-grow space-y-6">
                    {conversation
                        .filter(msg => msg.auteur) // On ne garde que les messages avec un auteur valide
                        .map((msg) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.auteur.id === user?.id ? 'justify-end' : ''}`}>
                            {msg.auteur.id !== user?.id && (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                                    {msg.auteur.name.charAt(0)}
                                </div>
                            )}
                            <div className={`w-full max-w-lg p-4 rounded-lg ${msg.auteur.id === user?.id ? 'bg-[#F28C38] text-white' : 'bg-gray-100'}`}>
                                <div className={`flex items-baseline space-x-2 ${msg.auteur.id === user?.id ? 'justify-end' : ''}`}>
                                    <p className="font-bold">{msg.auteur.name}</p>
                                    <p className={`text-xs ${msg.auteur.id === user?.id ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.created_at).toLocaleTimeString()}</p>
                                </div>
                                <p className="mt-1">{msg.contenu}</p>
                            </div>
                             {msg.auteur.id === user?.id && (
                                <div className="h-10 w-10 rounded-full bg-[#F28C38] flex-shrink-0 flex items-center justify-center font-bold text-white">
                                    {msg.auteur.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                    <form onSubmit={handleCommentSubmit}>
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full border-gray-200 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" 
                            rows="3" 
                            placeholder="Type your message here..."
                        ></textarea>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t">
                            <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                <PaperClipIcon className="h-6 w-6" />
                            </button>
                            <button type="submit" className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-orange-600 flex items-center">
                                Send Reply
                                <PaperAirplaneIcon className="h-5 w-5 ml-2 -rotate-45" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="font-bold text-gray-800 text-lg">Ticket Information</h3>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">Status</p>
                        <div className="flex justify-between items-center mt-1">
                            <StatusBadge type="status" value={ticket.statut} />
                            <button className="text-sm text-blue-500 font-semibold hover:underline">Change</button>
                        </div>
                    </div>
                    <div className="mt-4 border-t pt-4 space-y-3 text-sm">
                        <div className="flex items-center"><TicketIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">ID:</span><span className="font-semibold text-gray-800 ml-2">TKT-{ticket.id}</span></div>
                        <div className="flex items-center"><StarIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Priority:</span><span className="font-semibold text-red-500 ml-2">{ticket.categorie}</span></div>
                        <div className="flex items-center"><ClockIcon className="h-5 w-5 text-gray-400 mr-3" /><span className="text-gray-500">Last Updated:</span><span className="font-semibold text-gray-800 ml-2">{new Date(ticket.updated_at).toLocaleDateString()}</span></div>
                    </div>
                     <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-gray-500">Assigned to</p>
                        <div className="flex justify-between items-center mt-1">
                            <span className="font-semibold text-gray-800">{ticket.agent?.name || 'Unassigned'}</span>
                            <button className="text-sm text-blue-500 font-semibold hover:underline">Assign</button>
                        </div>
                    </div>
                     <div className="mt-4 border-t pt-4">
                        <p className="text-sm text-gray-500">Created by</p>
                        <div className="flex items-center mt-2">
                             <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">{ticket.createur?.name?.charAt(0) || '?'}</div>
                             <div className="ml-3">
                                <p className="font-semibold text-gray-800">{ticket.createur?.name || "Unknown"}</p>
                                <p className="text-xs text-gray-500">Created on {new Date(ticket.created_at).toLocaleDateString()}</p>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-3">
                    <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Close Ticket</button>
                    <button className="w-full bg-white text-gray-800 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-50">Print Ticket</button>
                </div>
            </div>
        </div>
    );
};


export default TicketDetailPage;


